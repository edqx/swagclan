<script context="module">
    import { browser } from "$app/env";
    import { VITE_BASE_API } from "$lib/env.js";

    import * as swagclan from "$lib/api";

	export async function load({ page, fetch, session, context }) {
        if (!browser) {
            return {
                props: {
                    commands: []
                }
            }
        }

        try {
            return {
                props: {
                    commands: await swagclan.getCommands()
                }
            }
        } catch (e) {
            return e;
        }
	}
</script>

<script lang="ts">
    import { invalidate, goto } from "$app/navigation";
    import { page } from "$app/stores";

    import PlusIcon from "$lib/icons/PlusIcon.svg";

    import CustomCommand from "$components/CustomCommand.svelte";
    import Searchbar from "$components/Searchbar.svelte";
    import Snackbar from "$components/Snackbar.svelte";

    export let commands: { name: string, tags: string[] }[];

    let last_deleted = false;
    let last_deleted_idx = -1;

    let snackbar_open = false;
    let close_snackbar = null;
    let snackbar_message = "";
    function showMessage(message: string) {
        snackbar_open = true;
        snackbar_message = message;
    }

    const deleted_id = $page.query.get("deleted");
    if (deleted_id) {
        if (browser) window.history.replaceState({}, document.title, location.pathname);
        swagclan
            .updateCommand(deleted_id, { deleted: true })
            .then(() => {
                deleteCommand(commands.find(command => command.id === deleted_id));
            })
            .catch(e => {
                showMessage("Failed to delete command. (" + e.details + ")");
            });
    }

    function deleteCommand(command) {
        const idx = commands.indexOf(command);

        if (idx === -1)
            return;

        commands.splice(idx, 1);
        commands = commands;

        last_deleted = command;
        last_deleted_idx = idx;

        showMessage("Deleted command.");
    }

    async function undoDelete(command) {
        try {
            await swagclan.updateCommand(command.id, { deleted: false });

            if (close_snackbar) {
                close_snackbar();
            }
        } catch (e) {
            showMessage("Couldn't bring back your command, go to your trash and try to retrieve it from there.");
        }

        if (last_deleted) {
            if (last_deleted_idx >= 0) {
                commands.splice(last_deleted_idx, 0, command);
            } else {
                commands.unshift(command);
            }
            commands = commands;
        } else {
            await invalidate("/dashboard/commands");
        }
    }

    let search_term;
    $: found_commands = search_term ? commands.filter(command => {
        return command.name.toLowerCase().indexOf(search_term.toLowerCase()) > -1 ||
            command.tags.some(tag =>
            search_term.toLowerCase().indexOf(tag.toLowerCase()) > -1 ||
                tag.toLowerCase().indexOf(search_term) > -1);
    }) : commands;

    async function createCommand() {
        try {
            const command = await swagclan.createCommand({
                name: "New Command",
                summary: "A brand new command.",
                tags: [],
                thumbnail: "",
                private: true,
                deleted: false
            });

            goto("/dashboard/commands/" + command.id);
            await invalidate("/dashboard/commands");
        } catch (e) {
            console.log(e);
            showMessage("Failed to create the custom command. (" + e.details + ")");
        }
    }
</script>

<svelte:head>
    <title>Custom Commands | SwagClan</title>
</svelte:head>

<div class="search-commands">
    <Searchbar bind:value={search_term}/>
    <span class="num-results">{found_commands.length}&nbsp;Result{found_commands.length === 1 ? "" : "s"}</span>
</div>

<div class="command-list">
    {#each found_commands as command}
        <CustomCommand
            {command}
            on:delete={() => deleteCommand(command)}
            on:error={err => showMessage(err.detail)}
            show_author={false}
            show_edits={true}
        />
    {/each}
    <div class="create-command" on:click={createCommand}>
        <PlusIcon width={64}/>
    </div>
</div>

<Snackbar bind:open={snackbar_open} bind:close={close_snackbar}>
    {snackbar_message}
    {#if snackbar_message === "Deleted command."}
        <button class="info" style="margin-left: 8px;" on:click={() => undoDelete(last_deleted)}>Undo</button>
    {/if}
</Snackbar>

<style>
    .search-commands {
        display: flex;
        align-items: center;
        margin: 8px;
        width: 650px;
    }

    .num-results {
        margin-left: 12px;
    }

    .command-list {
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
    }

    .create-command {
        width: 225px;
        height: 375px;
        border-radius: 8px;
        margin: 8px;
        outline: 15px solid var(--dark-card1);
        outline-offset: -15px;
        box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.5);
        transition: box-shadow 0.2s ease-in-out;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 92px;
        color: var(--dark-card1);
    }

    .create-command:hover {
        box-shadow: 0px 6px 15px rgba(0, 0, 0, 0.5);
    }

    @media (max-width: 920px) {
        .search-commands {
            width: auto;
        }

        .command-list {
            flex-wrap: nowrap;
            flex-direction: column;
            align-items: stretch;
        }

        .create-command {
            width: auto;
            height: auto;
            padding-top: 32px;
            padding-bottom: 32px;
        }
    }
</style>
