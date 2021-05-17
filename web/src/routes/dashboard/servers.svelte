<script context="module">
    import { browser } from "$app/env";
    import { VITE_BASE_API } from "$lib/env.js";

    import * as swagclan from "$lib/api";

    export async function load({ page, fetch, session, context }) {
        if (!browser) {
            return {
                props: {
                    guilds: []
                }
            }
        }

        try {
            return {
                props: {
                    guilds: await swagclan.getGuilds()
                }
            };
        } catch (e) {
            console.log(e);
            return e;
        }
	}
</script>

<script lang="ts">
    import { goto } from "$app/navigation";
    import GuildList from "$components/GuildList.svelte";

    export let guilds;

    function onSelect(guild) {
        goto("/servers/" + guild.id);
    }
</script>

<svelte:head>
    <title>My Servers | SwagClan</title>
</svelte:head>

<div class="server-list-wrapper">
    <GuildList {guilds} on:select={e => onSelect(e.detail)}/>
</div>

<style>
    .server-list-wrapper {
        width: 100%;
        margin-top: 8px;
        display: flex;
        justify-content: center;
    }

    @media (max-width: 920px) {
        .server-list-wrapper {
            flex-direction: column;
        }
    }
</style>
