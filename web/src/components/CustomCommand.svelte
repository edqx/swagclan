<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";
    import PencilIcon from "$lib/icons/PencilIcon.svg";
    import TrashIcon from "$lib/icons/TrashIcon.svg";

    import { VITE_BASE_API } from "$lib/env.js";
    import * as swagclan from "$lib/api";

    const dispatch = createEventDispatcher();

    export let command;
    export let version = command?.latest;
    export let show_author = true;
    export let show_edits = false;

    $: command = {
        id: "",
        draft_guild_id: "",
        name: "",
        summary: "",
        tags: [],
        thumbnail: "",
        author: null,
        author_id: "",
        private: true,
        deleted: false,
        versions: {},
        latest: null,
        first: null,
        guild_count: 0,
        ...command
    };

    $: backgroundUrl = `url("${command.thumbnail}")`;

    async function deleteCommand() {
        const areYouSure = confirm("Are you sure you want to delete this command? You will be able to retrieve it from the trash bin.");

        if (areYouSure) {
            try {
                await swagclan.updateCommand(command.id, { deleted: true });
                dispatch("delete");
            } catch (e) {
                console.log(e);
                dispatch("error", "Failed to delete command. (" + e.details + ")");
            }
        }
    }

    function formatTag(tag_name) {
        return tag_name[0].toUpperCase() + tag_name.substr(1).toLowerCase();
    }
</script>

<div class="custom-command">
    <div class="command-thumbnail" style="background-image: {backgroundUrl}">

    </div>
    <div class="command-info">
        <div class="basic-info-wrapper">
            {#if show_edits}
                <div class="desktop command-actions">
                    <a class="command-action" href="/dashboard/commands/{command.id}"><PencilIcon width={20}/></a>
                    <a class="command-action" on:click={deleteCommand}><TrashIcon width={20}/></a>
                </div>
            {/if}
            <div class="basic-info">
                <span class="command-name">{command.name}</span>
                <div class="command-stats">
                    <span class="command-servers">{command.guild_count} Server{command.guild_count === 1 ? "" : "s"}</span>
                    {#if command.latest}
                        <span class="command-version">{version || command.latest}</span>
                    {:else}
                        <span class="command-version">No versions</span>
                    {/if}
                </div>
            </div>
        </div>
        <span class="desktop command-tags">
            {#each command.tags as tag_name}
                <span class="command-tag">{formatTag(tag_name)}</span>
            {/each}
        </span>
        <span class="command-description">
            {command.summary}
        </span>
        {#if !command.private}
            <a class="command-marketplace" href="/market/{command.id}">View on Marketplace</a>
        {/if}
        {#if show_author && command.author}
            <div class="command-author desktop">
                <img class="avatar" src="https://cdn.discordapp.com/avatars/{command.author.id}/{command.author.avatar}.{command.author.avatar.startsWith("a_") ? "gif" : "png"}" alt="user avatar"/>
                <span class="username">
                    {command.author.username}#{command.author.discriminator}
                </span>
            </div>
        {/if}
    </div>
    {#if show_edits}
        {#if show_author && command.author}
            <div class="command-author mobile">
                <img class="avatar" src="https://cdn.discordapp.com/avatars/{command.author.id}/{command.author.avatar}.{command.author.avatar.startsWith("a_") ? "gif" : "png"}" alt="user avatar"/>
                <span class="username">
                    {command.author.username}#{command.author.discriminator}
                </span>
            </div>
        {/if}
        <div class="mobile command-actions">
            <a class="command-action" href="/dashboard/commands/{command.id}"><PencilIcon width={30}/></a>
            <a class="command-action" on:click={deleteCommand}><TrashIcon width={30}/></a>
        </div>
    {/if}
</div>

<style>
    .custom-command {
        margin: 8px;
        border-radius: 8px;
        background-color: #27283c;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        width: 225px;
        height: 375px;
        box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.5);
        transition: box-shadow 0.2s ease-in-out;
    }

    .command-thumbnail {
        flex: 4 1 0;
        background-position: 50% 50%;
        background-size: 100%;
    }

    .command-info {
        flex: 5 1 0;
        padding: 16px;
        display: flex;
        flex-direction: column;
    }

    .basic-info {
        display: flex;
        flex-direction: column;
    }

    .command-name {
        font-size: 24px;
    }

    .command-actions {
        float: right;
        display: flex;
        flex-direction: column;
    }

    .command-servers {
        font-size: 12px;
    }

    .command-version {
        margin-left: 16px;
        font-size: 12px;
    }

    .command-tags {
        display: flex;
        flex-wrap: wrap;
        margin-top: 4px;
        margin-bottom: 4px;
    }

    .command-tag {
        padding: 2px;
        margin: 4px;
        border-radius: 50px;
        background-color: #2c3e7e;
        padding-left: 12px;
        padding-right: 12px;
        font-style: italic;
        font-size: 13px;
    }

    .command-description {
        font-style: italic;
        max-height: 65px;
        overflow: hidden;
    }

    .command-marketplace {
        order: 2;
        margin-top: auto;
        font-style: italic;
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

    .command-author {
        order: 2;
        margin-top: auto;
        display: flex;
        align-items: center;
    }

    .username {
        margin-left: 4px;
    }

    .mobile {
        display: none;
    }

    @media (max-width: 920px) {
        .custom-command {
            display: grid;
            grid-template-columns: auto 1fr auto;
            width: auto;
            height: auto;
            align-items: center;
            padding: 16px;
        }

        .custom-command .command-name {
            font-size: 24px;
        }

        .custom-command .command-description {
            display: none;
        }

        .custom-command .command-thumbnail {
            border-radius: 50%;
            flex: initial;
            width: 86px;
            height: 86px;
        }

        .custom-command .command-marketplace {
            display: none;
        }

        .custom-command .command-info {
            flex: initial;
        }

        .custom-command .command-actions {
            order: 2;
            margin-left: auto;
            flex-direction: row;
        }

        .custom-command .mobile {
            display: inline-block;
        }

        .custom-command .desktop {
            display: none;
        }
    }
</style>
