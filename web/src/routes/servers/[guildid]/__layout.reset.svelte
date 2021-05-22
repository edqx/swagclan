<script context="module">
    import { browser } from "$app/env";
    import { VITE_BASE_API } from "$lib/env.js";

    import * as swagclan from "$lib/api";

	export async function load({ page, fetch, session, context }) {
        if (!browser) {
            return {
                props: {
                    guild: null,
                    user: null
                }
            }
        }

        try {
            const [ user, guild ] = await Promise.all([
                swagclan.getUser(),
                swagclan.getGuild(page.params.guildid)
            ]);

            return {
                props: {
                    user,
                    guild
                }
            }
        } catch (e) {
            if (e.details === "BOT_NOT_IN_GUILD") {
                const state = encodeURIComponent(JSON.stringify({
                    type: "dashboard"
                }));

                return {
                    status: 302,
                    redirect: `https://discord.com/api/oauth2/authorize?client_id=${VITE_CLIENT_ID}&permissions=8&guild_id=${page.params.guildid}&response_type=code&redirect_uri=${encodeURIComponent(location.origin)}%2Fcallback&state=${state}&scope=bot%20applications.commands`
                }
            }

            console.log(e);
            return e;
        }
	}
</script>

<script lang="ts">
    import type { BasicGuild } from "@wilsonjs/models";

    import { setContext } from "svelte";
    import { page } from "$app/stores";

    import HomeIcon from "$lib/icons/HomeIcon.svg";
    import ChatIcon from "$lib/icons/ChatIcon.svg";
    import ClipboardIcon from "$lib/icons/ClipboardIcon.svg";
    import CodeIcon from "$lib/icons/CodeIcon.svg";
    import ArchiveIcon from "$lib/icons/ArchiveIcon.svg";
    import MetricsIcon from "$lib/icons/MetricsIcon.svg";

    import GuildIcon from "$components/GuildIcon.svelte";
    import RootLayout from "../../__layout.svelte";

    export let guild: BasicGuild;
    export let user: BasicUser;

    setContext("guild", guild);

    let innerWidth = 1920;

    $: pages = innerWidth <= 920 ? {
        "/": {
            name: "Home",
            hidden: false,
            authorized: false,
            icon: HomeIcon,
            children: {}
        },
        "/dashboard/servers": {
            name: "Back to Server List",
            hidden: false,
            authorized: false,
            icon: ChatIcon,
            children: {}
        },
        ["/servers/" + guild.id]: {
            name: "Overview",
            hidden: false,
            authorized: false,
            icon: ClipboardIcon,
            children: {}
        },
        ["/servers/" + guild.id + "/commands"]: {
            name: "Custom Commands",
            hidden: false,
            authorized: false,
            icon: CodeIcon,
            children: {}
        },
        ["/servers/" + guild.id + "/logs"]: {
            name: "Logs",
            hidden: false,
            authorized: false,
            icon: ArchiveIcon,
            children: {}
        },
        ["/servers/" + guild.id + "/metrics"]: {
            name: "Server Metrics",
            hidden: false,
            authorized: false,
            icon: MetricsIcon,
            children: {}
        }
    } : undefined;
</script>

<svelte:window bind:innerWidth/>

<RootLayout {user} {pages}>
    <div class="sidebar">
        <span class="sidebar-title center">Server Dashboard</span>
        <div class="guild-icon"><GuildIcon {guild} size={86}/></div>
        <span class="sidebar-guild-members center ">{guild?.approximate_member_count || 0} Member{guild?.approximate_member_count === 1 ? "" : "s"}</span>
        <span class="sidebar-guild-name center">
            {guild?.name || ""}
            {#if guild?.premium}
                <span class="premium">PREMIUM</span>
            {/if}
        </span>
        <a class="sidebar-item" href="/servers/{guild?.id}" class:active={$page.path === "/servers/" + guild?.id}>
            <ClipboardIcon width={20}/>Overview
        </a>
        <a class="sidebar-item" href="/servers/{guild?.id}/commands" class:active={$page.path.startsWith("/servers/" + guild?.id + "/commands")}>
            <CodeIcon width={20}/>Custom&nbsp;Commands
        </a>
        <a class="sidebar-item" href="/servers/{guild?.id}/logs" class:active={$page.path.startsWith("/servers/" + guild?.id + "/logs")}>
            <ArchiveIcon width={20}/>Logs
        </a>
        <a class="sidebar-item" href="/servers/{guild?.id}/metrics" class:active={$page.path.startsWith("/servers/" + guild?.id + "/metrics")}>
            <MetricsIcon width={20}/>Server&nbsp;Metrics
        </a>
    </div>
    <div class="dashboard-main">
        <slot/>
    </div>
</RootLayout>

<style>
    .navbar {
        display: flex;
        align-items: center;
        background-color: var(--dark-card1);
        box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.5);
        padding-left: 16px;
        padding-right: 16px;
        z-index: 1;
        position: sticky;
    }

    .dashboard-wrapper {
        display: flex;
        flex: 1 1 0;
    }

    .dashboard-main {
        padding-left: 8px;
        padding-right: 8px;
        padding-top: 8px;
        flex: 1 0 0;
    }

    .sidebar {
        background-color: var(--dark-card1);
        display: flex;
        flex-direction: column;
        padding-top: 8px;
        box-shadow: 4px 0px 10px rgba(0, 0, 0, 0.5);
        flex: 0 1 0;
    }

    .sidebar-item {
        padding: 16px;
        border-left: 4px solid transparent;
        display: flex;
        align-items: center;
        color: inherit;
    }

    .sidebar-item:hover {
        text-decoration: none;
    }

    .active {
        background-color: rgba(255, 255, 255, 0.05);
        border-left: 4px solid #00ffd9ff !important;
    }

    .guild-icon {
        align-self: center;
        padding-top: 14px;
        padding-bottom: 14px;
    }

    .sidebar-guild-members {
        font-size: 14px;
    }

    .sidebar-guild-name {
        text-align: center;
        margin-bottom: 14px;
    }

    .center {
        text-align: center;
    }

    .sidebar-title {
        font-size: 14px;
        margin-top: 4px;
    }

    .premium {
        border: 1px solid var(--dark-link);
        border-radius: 8px;
        font-size: 8pt;
        font-weight: 700;
        padding: 2px;
        padding-left: 6px;
        padding-right: 6px;
        background-color: var(--dark-bg);
    }

    @media (max-width: 920px) {
        .sidebar {
            display: none;
        }
    }
</style>
