<script context="module">
    import { browser } from "$app/env";
    import { VITE_CLIENT_ID, VITE_BASE_API, VITE_SCOPE } from "$lib/env";
    import * as swagclan from "$lib/api";

	/**
	 * @type {import('@sveltejs/kit).Load}
	 */
	export async function load({ page, fetch, session, context }) {
        if (!browser) {
            return {
                props: {
                    user: null
                }
            }
        }

        try {
            return {
                props: {
                    user: await swagclan.getUser()
                }
            };
        } catch (e) {
            console.log(e);
            return e;
        }
	}
</script>

<script lang="ts">
    import Snackbar from "$components/Snackbar.svelte";

    import HomeIcon from "$lib/icons/HomeIcon.svg";
    import LightningIcon from "$lib/icons/LightningIcon.svg";
    import ShoppingIcon from "$lib/icons/ShoppingIcon.svg";
    import FireIcon from "$lib/icons/FireIcon.svg";
    import StatusIcon from "$lib/icons/StatusIcon.svg";
    import SettingsIcon from "$lib/icons/SettingsIcon.svg";
    import ChatIcon from "$lib/icons/ChatIcon.svg";
    import CodeIcon from "$lib/icons/CodeIcon.svg";
    import CardIcon from "$lib/icons/CardIcon.svg";
    import LinkIcon from "$lib/icons/LinkIcon.svg";
    import AccountIcon from "$lib/icons/AccountIcon.svg";
    import XIcon from "$lib/icons/XIcon.svg";
    import MenuIcon from "$lib/icons/MenuIcon.svg";

    import { setContext } from "svelte";
    import { fly } from "svelte/transition";
	import { page } from "$app/stores";

    export let user;

    setContext("user", user);

    export let pages = {
        "/": {
            name: "Home",
            hidden: false,
            authorized: false,
            icon: HomeIcon,
            children: {}
        },
        "/features": {
            name: "Features",
            hidden: false,
            authorized: false,
            icon: LightningIcon,
            children: {}
        },
        "/market": {
            name: "Marketplace",
            hidden: false,
            authorized: false,
            icon: ShoppingIcon,
            children: {}
        },
        "/premium": {
            name: "Premium",
            hidden: false,
            authorized: false,
            icon: FireIcon,
            children: {}
        },
        "/status": {
            name: "Status",
            hidden: false,
            authorized: false,
            icon: StatusIcon,
            children: {}
        },
        "/dashboard": {
            name: "Dashboard",
            hidden: false,
            authorized: true,
            icon: SettingsIcon,
            children: {
                "/dashboard/servers": {
                    name: "Your Servers",
                    authorized: true,
                    icon: ChatIcon
                },
                "/dashboard/commands": {
                    name: "Custom Commands",
                    authorized: true,
                    icon: CodeIcon
                },
                "/dashboard/premium": {
                    name: "Subscription",
                    authorized: true,
                    icon: CardIcon
                },
                "/dashboard/connections": {
                    name: "Connections",
                    authorized: true,
                    icon: LinkIcon
                },
                "/dashboard/account": {
                    name: "Account",
                    authorized: true,
                    icon: AccountIcon
                }
            }
        },
        "/servers": {
            name: "Servers",
            hidden: true,
            authorized: true,
            icon: undefined,
            children: {}
        }
    };

    $: shown_pages = Object.entries(pages).filter(([, guild]) => !guild.hidden);

    $: current_page = Object.entries(pages).reverse().find(([ href ]) => $page.path.startsWith(href));

    $: current_page_child = Object.entries(pages).reduce((acc, cur) => [...acc, cur, ...Object.entries(cur[1].children)], []).reverse().find(([ href ]) => $page.path.startsWith(href));

    $: unauthorized_pages = shown_pages.filter(([, route]) => !route.authorized);
    $: authorized_pages = shown_pages.filter(([, route]) => route.authorized);

    let menu_open = false;
    let innerWidth = 1920;

    $: if (innerWidth > 920) {
        menu_open = false;
    }

    $: $page.path && (menu_open = false);

    const bot_invite = `https://discord.com/oauth2/authorize?client_id=${VITE_CLIENT_ID}&redirect_uri=${VITE_BASE_API}/exchange&response_type=code&scope=${VITE_SCOPE}`;
</script>

<svelte:window bind:innerWidth/>

<div class="navbar">
    <a class="unclickable navbar-item" href="/">
        <img src="/logoDesktop.png" height=36 alt="swagclan" class="desktop"/>
        <img src="/logoMobile.png" height=36 alt="swagclan" class="mobile"/>
    </a>
    <div class="navbar-items">
        <div class="mobile current-page">{current_page_child?.[1]?.name}</div>
        {#each unauthorized_pages as [ href, route ], i}
            <a class:ldivider={i === 0} {href} class="navbar-item" class:active={current_page?.[0] === href}>
                {route.name}
            </a>
        {/each}
        <div class="right">
            <!-- svelte-ignore a11y-missing-attribute -->
            <a class="navbar-item burger" on:click={() => menu_open = !menu_open} class:active={menu_open}>
                {#if browser}
                    {#if menu_open}
                        <XIcon width={28}/>
                    {:else}
                        <MenuIcon width={28}/>
                    {/if}
                {/if}
            </a>
            {#if user}
                <!-- svelte-ignore a11y-missing-attribute -->
                <a class="me navbar-item">
                    <img class="avatar" src="https://cdn.discordapp.com/avatars/{user.id}/{user.avatar}.{user.avatar.startsWith("a_") ? "gif" : "png"}" alt="user avatar"/>
                    <span class="username">{user.username}<span class="discriminator">#{user.discriminator}</span></span>
                </a>
                {#each authorized_pages as [ href, route ], i}
                    <a class:ldivider={i === 0} class:rdivider={i === authorized_pages.length - 1}  {href} class="navbar-item" class:active={current_page?.[0] === href}>
                        {route.name}
                    </a>
                {/each}
                <a href="/logout" class="navbar-item">
                    <button class="danger">
                        Logout
                    </button>
                </a>
            {:else}
                <a class="navbar-item" style="font-style: normal;" href={bot_invite}>
                    Login with <img class="discord-logo" src="/DiscordWhite.svg" height=24 alt="discord"/>
                </a>
            {/if}
        </div>
    </div>
</div>
<div class="main-wrapper">
    {#if menu_open}
        <div in:fly out:fly class="menu-wrapper">
            <div class="menu">
                {#if user}
                    <!-- svelte-ignore a11y-missing-attribute -->
                    <a class="me menu-item">
                        <img class="avatar" src="https://cdn.discordapp.com/avatars/{user.id}/{user.avatar}.{user.avatar.startsWith("a_") ? "gif" : "png"}" alt="user avatar"/>
                        <span class="username">{user.username}<span class="discriminator">#{user.discriminator}</span></span>

                        <a href="/logout" class="right">
                            <button class="danger">
                                Logout
                            </button>
                        </a>
                    </a>
                {:else}
                    <a class="menu-item" style="font-style: normal;" href={bot_invite}>
                        Login with <img src="/DiscordWhite.svg" height=24 alt="discord" style="margin-top: 4px;margin-left:4px"/>
                    </a>
                {/if}
                {#each unauthorized_pages as [ href, route ], i}
                    <a {href} class="menu-item" class:active={current_page_child?.[0] === href}>
                        <svelte:component this={route.icon} width={20} class="icon"/>
                        {route.name}
                    </a>

                    {#each Object.entries(route.children) as [ href, route ], i}
                        <a {href} class="menu-item child" class:active={current_page_child?.[0] === href}>
                            <svelte:component this={route.icon} width={20} class="icon"/>
                            {route.name}
                        </a>
                    {/each}
                {/each}
                {#if user}
                    {#each authorized_pages as [ href, route ], i}
                        <a {href} class="menu-item" class:active={current_page_child?.[0] === href}>
                            <svelte:component this={route.icon} width={20} class="icon"/>
                            {route.name}
                        </a>

                        {#each Object.entries(route.children) as [ href, route ], i}
                            <a {href} class="menu-item child" class:active={current_page_child?.[0] === href}>
                                <svelte:component this={route.icon} width={20} class="icon"/>
                                {route.name}
                            </a>
                        {/each}
                    {/each}
                {/if}
            </div>
        </div>
    {/if}
    <div class="main">
        <slot></slot>
    </div>
</div>

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

    .main-wrapper {
        display: flex;
        position: relative;
        flex: 1 1 0;
    }

    .main {
        display: flex;
        flex: 1 1 0;
    }

    .menu-wrapper {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
    }

    .menu {
        display: none;
        background-color: var(--dark-card1);
        flex-direction: column;
        align-items: stretch;
    }

    .menu-item {
        display: flex;
        align-items: center;
        padding: 16px;
        color: inherit;
    }

    .menu-item:hover {
        text-decoration: none;
    }

    .menu-item.child {
        padding-left: 64px;
    }

    .navbar-items {
        flex: 1 1 0;
        display: flex;
        align-items: center;
    }

    .navbar-item {
        color: inherit;
    }

    .navbar-item:hover {
        text-decoration: none;
    }

    .right {
        order: 2;
        margin-left: auto;
        display: flex;
        align-items: center;
    }

    .navbar .navbar-item {
        padding: 8px;
        padding-left: 16px;
        padding-right: 16px;
        font-style: italic;
        display: flex;
        align-items: center;
    }

    .active {
        background-color: rgba(255, 255, 255, 0.05);
    }

    .ldivider {
        border-left: 1px solid #cfcfcf;
    }

    .rdivider {
        border-right: 1px solid #cfcfcf;
    }

    .discriminator {
        margin-left: 1px;
        font-weight: 700;
        font-size: 9px;
    }

    .burger {
        display: none !important;
    }

    .mobile {
        display: none;
    }

    .discord-logo {
        margin-top: 2px;
        margin-left: 6px;
    }

    @media (max-width: 1080px) {
        .username {
            display: none;
        }
    }

    @media (max-width: 920px) {
        .username {
            display: inline-block;
        }

        .navbar-items a:not(.burger) {
            display: none;
        }

        .burger {
            display: inline-block !important;
        }

        .mobile {
            display: inline-block;
        }

        .desktop {
            display: none;
        }

        .menu {
            display: flex !important;
        }
    }
</style>
