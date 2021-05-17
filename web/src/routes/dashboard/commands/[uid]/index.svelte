<script context="module">
    import { browser } from "$app/env";
    import { VITE_BASE_API } from "$lib/env.js";

    import * as swagclan from "$lib/api";

	export async function load({ page, fetch, session, context }) {
        if (!browser) {
            return {
                props: {
                    command: {}
                }
            }
        }

        try {
            return {
                props: {
                    command: await swagclan.getCommand(page.params.uid)
                }
            }
        } catch (e) {
            console.log(e);
            return e;
        }
	}
</script>

<script lang="ts">
    import { getContext } from "svelte";
    import { goto, invalidate } from "$app/navigation";

    import TagIcon from "$lib/icons/TagIcon.svg";
    import TrashIcon from "$lib/icons/TrashIcon.svg"

    import CustomCommand from "$components/CustomCommand.svelte";
    import GuildPreview from "$components/GuildPreview.svelte";
    import Searchbar from "$components/Searchbar.svelte";
    import Snackbar from "$components/Snackbar.svelte";
    import Switch from "$components/Switch.svelte";

    import RootError from "../../../__error.svelte";

    export let command;

    let snackbar_open = false;
    let snackbar_message;
    function showMessage(message) {
        snackbar_open = true;
        snackbar_message = message;
    }

    let copy = { ...command };

    let dirty = false;

    let tags_input = "";
    let eTagInput = null;
    let eSave = null;

    let user = getContext("user");

    if (user?.id !== command?.author_id) {
        goto("/dashboard/commands", { replaceState: true });
    }

    function removeTag(tag) {
        copy.tags = copy.tags.filter(t => t !== tag);
        copy.tags = copy.tags;
        dirty = true;
    }

    function handleTagInput() {
        const last_char = tags_input[tags_input.length - 1];

        if (!last_char)
            return;

        if (tags_input.endsWith(" ")) {
            const trimmed = tags_input.substr(0, tags_input.length - 1);

            if (!trimmed)
                return;

            if (copy.tags.find(t => t === trimmed)) {
                tags_input = trimmed;
                return;
            }

            addTag(trimmed);
            tags_input = "";
        }
    }

    function handleTagKeypress(e) {
        if (e.keyCode === 8) {
            if (tags_input === "") {
                const last = copy.tags.pop();
                copy.tags = copy.tags;
                dirty = true;

                if (!last)
                    return;

                tags_input = last + " ";
            }
        } else if (e.keyCode === 13) {
            if (!tags_input)
                return;

            if (copy.tags.find(t => t === tags_input)) {
                return;
            }

            addTag(tags_input);
            tags_input = "";
        }
    }

    function addTag(tag) {
        if (!tag)
            return;

        copy.tags.push(tag);
        copy.tags = copy.tags;
        dirty = true;
    }

    function formatTag(tag_name) {
        return tag_name[0].toUpperCase() + tag_name.substr(1).toLowerCase();
    }

    $: copy.tags && eTagInput && (eTagInput.disabled = copy.tags.length >= 3);

    $: tags_input = tags_input ? formatTag(tags_input) : "";
    $: copy.tags = copy.tags ? copy.tags.map(formatTag) : [];

    $: eSave && (eSave.disabled = !dirty);

    async function saveCommand() {
        dirty = false;

        try {
            const new_command = await swagclan.updateCommand(command.id, {
                name: copy.name,
                summary: copy.summary,
                tags: copy.tags,
                thumbnail: copy.thumbnail,
                deleted: copy.deleted,
                private: copy.private
            });

            command.name = new_command.name;

            showMessage("Successfully saved command!");
        } catch (e) {
            showMessage("Failed to save command (" + e.details + ")");
        }
    }

    async function deleteCommand() {
        const areYouSure = confirm("Are you sure you want to delete this command? You will be able to retrieve it from the trash bin.");

        if (areYouSure) {
            goto("/dashboard/commands?deleted=" + command.id);
            await invalidate("/dashboard/commands/" + command.id);
        }
    }

    let draft_guild_id = command.draft_guild_id;

    let draft_guild = {
        id: command.draft_guild_id
    };

    async function removeDraftServer() {
        try {
            await swagclan.removeGuildCommand(command.draft_guild_id, command.id);
            command.draft_guild_id = undefined;
            draft_guild_id = undefined;
            command = command;
        } catch (e) {
            console.log(e);
            showMessage("Failed to remove command from the server (" + e.details + ")");
        }
    }

    let is_mobile = false;

    let is_public = false;
    $: copy.private = !is_public;
</script>

<svelte:head>
    <title>{command.name} | Custom Commands | SwagClan</title>
</svelte:head>

<Snackbar bind:open={snackbar_open}>{snackbar_message}</Snackbar>

<div class="command-editor-wrapper">
    <div class="command-info">
        <div class="command-thumbnail-wrapper">
            <div
                class="command-thumbnail"
                style="background-image: url({command.thumbnail})"
                on:error={e => e.target.style.visibility = "hidden"}
            />
            <a class="thumbnail-upload">Change image</a>
            <div class="command-stats">
                <span class="stat command-servers">{command.guild_count} Server{command.guild_count === 1 ? "" : "s"}</span>
                <br>
                {#if command.latest}
                    <span class="stat command-version"><b>{command.latest}<b></span>
                {:else}
                    <span class="stat command-version">No versions published</span>
                {/if}
            </div>
        </div>
        <div class="basic-info">
            <div class="command-field">
                <div style="display: flex; align-items: center;">
                    <Switch bind:toggled={is_public} on:change={() => dirty = true}/>
                    <span style="margin-left: 8px;">Allow anyone to add this command?</span>
                </div>
            </div>
            <div class="command-field">
                <span class="field-name">Name</span>
                <input class="field-input" bind:value={copy.name} on:input={() => dirty = true}/>
            </div>
            <div class="command-field">
                <span class="field-name">Description</span>
                <textarea class="field-input description" bind:value={copy.summary} on:input={() => dirty = true}/>
            </div>
            <div class="command-field">
                <span class="field-name">Tags</span>
                {#if copy.tags}
                    {#if is_mobile}
                        {#each copy.tags as tag}
                            <div class="tag-input-wrapper">
                                <input
                                    class="field-input tag-input"
                                    bind:value={tag}
                                    on:input={() => tag = formatTag(tag)}
                                />
                                <button class="danger compact" style="width: 25px" on:click={() => removeTag(tag)}>-</button>
                            </div>
                        {/each}
                        <div class="tag-input-wrapper">
                            <input
                                class="field-input tag-input"
                                bind:value={tags_input}
                            />
                            <button class="info compact" style="width: 25px; text-align: center;" on:click={() => addTag(tags_input)}>+</button>
                        </div>
                    {:else}
                        <div class="tag-list">
                            {#each copy.tags as tag}
                                <div class="tag" on:click={() => removeTag(tag)}>
                                    <TagIcon class="tag-icon" src="/TagIcon.svg" width={14}/>
                                    <span class="tag-name">{formatTag(tag)}</span>
                                </div>
                            {/each}
                            <input
                                class="field-input tag-input"
                                bind:value={tags_input}
                                on:input={handleTagInput}
                                on:keydown={handleTagKeypress}
                                bind:this={eTagInput}
                                placeholder="Enter tag"
                            />
                        </div>
                    {/if}
                {/if}
            </div>
            <div class="command-field">
                <span class="field-name">Testing Server</span>
                <div class="draft-server-wrapper">
                    {#if draft_guild_id}
                        <div class="draft-server">
                            <GuildPreview bind:guild={draft_guild}/>
                            <button class="remove-draft danger" on:click={() => removeDraftServer()}>Remove</button>
                        </div>
                    {:else}
                        <a href="/commands/{command.id}/select-server?v=draft&r=/dashboard/commands/{command.id}">Click to add to a server for testing</a>
                    {/if}
                </div>
            </div>
            <div class="command-actions">
                <button class="info save-command" bind:this={eSave} on:click={saveCommand}>Save</button>
                <a class="command-action delete-command" on:click={deleteCommand}><TrashIcon width={30}/></a>
            </div>
        </div>
    </div>
</div>


<style>
    .command-editor-wrapper {
        display: flex;
        justify-content: center;
        margin: 8px;
    }

    .command-info {
        background-color: var(--dark-card1);
        box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.5);
        padding: 8px;
        border-radius: 4px;
        display: flex;
    }

    .command-thumbnail-wrapper {
        display: flex;
        flex-direction: column;
        margin: 16px;
        max-width: 192px;
    }

    .command-thumbnail {
        background-size: 192px 192px;
        width: 192px;
        height: 192px;
        border-radius: 4px;
        border: 1px solid var(--dark-bg);
    }

    .command-stats {
        display: flex;
    }

    .stat {
        flex: 1 1 0;
    }

    .thumbnail-upload {
        margin-bottom: 8px;
    }

    .basic-info {
        margin: 16px;
        display: flex;
        flex-direction: column;
    }

    .command-field {
        display: flex;
        flex-direction: column;
        margin-bottom: 24px;
    }

    .field-name {
        margin-bottom: 4px;
    }

    .field-input {
        background-color: var(--dark-bg);
    }

    .description {
        resize: none;
        width: 500px;
    }

    .tag-list {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
    }

    .tag {
        cursor: pointer;
        display: flex;
        align-items: center;
        margin: 4px;
        padding: 4px;
        padding-left: 12px;
        padding-right: 12px;
        border-radius: 16px;
        border: 1px solid var(--dark-link);
        color: var(--dark-link);
    }

    .tag:hover {
        background-color: var(--dark-link-hover);
        color: white;
    }

    .tag:hover .tag-icon {
        display: none;
    }

    .tag:hover .tag-cross-icon {
        display: inline-block;
    }

    .tag-name {
        margin-left: 4px;
    }

    .tag:hover .tag-name {
        text-decoration: line-through;
    }

    .tag-input {
        margin-left: 4px;
        width: 100px;
    }

    .tag-input-wrapper .tag-input {
        margin-bottom: 8px;
    }

    .command-actions {
        display: flex;
    }

    .save-command {
        flex: 1 1 0;
    }

    .delete-command {
        margin-left: 8px;
    }

    .command-action {
        padding: 6px;
        padding-left: 6px;
        padding-right: 6px;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .command-action:hover {
        background-color: rgba(255, 255, 255, 0.05);
    }

    .draft-server {
        display: flex;
    }

    .remove-draft {
        margin-left: 8px;
    }

    @media (max-width: 1080px) {
        .description {
            width: 350px;
        }
    }

    @media (max-width: 920px) {
        .command-info {
            width: 100%;
            flex-direction: column;
        }

        .field-input {
            font-size: 12pt;
        }

        .description {
            width: auto;
            height: 225px;
        }
    }
</style>
