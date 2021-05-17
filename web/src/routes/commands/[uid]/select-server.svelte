<script context="module">
    import { browser } from "$app/env";
    import { VITE_BASE_API } from "$lib/env.js";

    import * as swagclan from "$lib/api";

	export async function load({ page, fetch, session, context }) {
        if (!browser) {
            return {
                props: {
                    command: {},
                    guilds: []
                }
            }
        }

        try {
            const [ command, guilds ] = await Promise.all([
                swagclan.getCommand(page.params.uid, { getAuthor: true }),
                swagclan.getCommandAvailableGuilds(page.params.uid)
            ]);

            return {
                props: {
                    command,
                    guilds
                }
            };
        } catch (e) {
            console.log(e);
            return e;
        }
	}
</script>

<script>
    import { page } from "$app/stores";
    import { goto, invalidate } from "$app/navigation";

    import PlusIcon from "$lib/icons/PlusIcon.svg";

    import CustomCommand from "$components/CustomCommand.svelte";
    import Searchbar from "$components/Searchbar.svelte";
    import GuildList from "$components/GuildList.svelte";
    import Snackbar from "$components/Snackbar.svelte";

    export let command;
    export let guilds;

    let snackbar_open = false;
    let snackbar_message = "";
    function showMessage(message) {
        snackbar_open = true;
        snackbar_message = message;
    }

    const command_version = $page.query.get("v") || command.version;

    async function onSelect(guild) {
        const redirect = $page.query.get("r") || ("/servers/" + guild.id + "/commands/" + command.id);

        try {
            const add = await swagclan.createGuildCommand(guild.id, {
                command_id: command.id,
                command_version: command_version,
                enabled: true,
                timeout: 0,
                config: {},
                permissions: []
            });
            await invalidate(redirect);
            goto(redirect);
        } catch (e) {
            console.log(e);
            showMessage("Failed to add command. (" + e.details + ")");
        }
    }
</script>

<svelte:head>
    <title>Select a server | SwagClan</title>
</svelte:head>

<Snackbar bind:open={snackbar_open}>
    {snackbar_message}
</Snackbar>

<div class="select-server-list">
    <CustomCommand {command} version={command_version} show_author={true}/>
    <GuildList {guilds} on:select={e => onSelect(e.detail)}>
        <div slot="icon">
            <PlusIcon width={30}/>
        </div>
    </GuildList>
</div>

<style>
    .select-server-list {
        width: 100%;
        margin-top: 8px;
        padding: 8px;
        display: flex;
        justify-content: center;
    }

    @media (max-width: 920px) {
        .select-server-list {
            flex-direction: column;
        }
    }
</style>
