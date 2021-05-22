<script context="module">
    import { page } from "$app/stores";
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
    import { VITE_CLIENT_ID } from "$lib/env.js";
    import { goto, invalidate } from "$app/navigation";

    import PlusIcon from "$lib/icons/PlusIcon.svg";

    import CustomCommand from "$components/CustomCommand.svelte";
    import Searchbar from "$components/Searchbar.svelte";
    import GuildList from "$components/GuildList.svelte";
    import Snackbar from "$components/Snackbar.svelte";

    export let command;
    export let guilds;

    let loading = false;

    let snackbar_open = false;
    let snackbar_message = "";
    function showMessage(message) {
        snackbar_open = true;
        snackbar_message = message;
    }

    const command_version = $page.query.get("v") || command.version;

    async function onSelect(guild) {
        loading = true;
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
            if (e.details === "BOT_HAS_INVALID_PERMISSIONS") {
                const state = encodeURIComponent(JSON.stringify({
                    type: "create-command",
                    command_id: $page.params.uid,
                    command_version,
                    redirect
                }));
                location.href = `https://discord.com/api/oauth2/authorize?client_id=${VITE_CLIENT_ID}&permissions=8&guild_id=${guild.id}&response_type=code&redirect_uri=${encodeURIComponent(location.origin)}%2Fcallback&state=${state}&scope=bot%20applications.commands`;
            } else {
                console.log(e);
                showMessage("Failed to add command. (" + e.details + ")");
                loading = false;
            }
        }
    }

    const error = $page.query.get("e");
    if (error) {
        showMessage("Failed to add command. (" + error + ")");
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
    <GuildList {guilds} on:select={e => onSelect(e.detail)} {loading}>
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
