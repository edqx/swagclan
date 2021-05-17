<script>
    import { page } from "$app/stores";

    import SettingsIcon from "$lib/icons/SettingsIcon.svg";
    import ChatIcon from "$lib/icons/ChatIcon.svg";
    import CodeIcon from "$lib/icons/CodeIcon.svg";
    import LightningIcon from "$lib/icons/LightningIcon.svg";
    import LinkIcon from "$lib/icons/LinkIcon.svg";
    import AccountIcon from "$lib/icons/AccountIcon.svg";
</script>

<svelte:head>
    <title>Dashboard | SwagClan</title>
</svelte:head>

<div class="dashboard-wrapper">
    <div class="sidebar">
        <a class="sidebar-item" href="/dashboard" class:active={$page.path === "/dashboard"}>
            <SettingsIcon width={20}/>Dashboard
        </a>
        <a class="sidebar-item" href="/dashboard/servers" class:active={$page.path === "/dashboard/servers"}>
            <ChatIcon width={20}/>Your&nbsp;Servers
        </a>
        <a class="sidebar-item" href="/dashboard/commands" class:active={$page.path === "/dashboard/commands"}>
            <CodeIcon width={20}/>Custom&nbsp;Commands
        </a>
        <div class="bdivider"></div>
        <a class="sidebar-item" href="/dashboard/premium" class:active={$page.path === "/dashboard/premium"}>
            <LightningIcon width={20}/>Subscription
        </a>
        <a class="sidebar-item" href="/dashboard/connections" class:active={$page.path === "/dashboard/connections"}>
            <LinkIcon width={20}/>Connections
        </a>
        <a class="sidebar-item" href="/dashboard/account" class:active={$page.path === "/dashboard/account"}>
            <AccountIcon width={20}/>Account
        </a>
    </div>
    <div class="dashboard-main">
        <slot></slot>
    </div>
</div>

<style>
    .dashboard-wrapper {
        display: flex;
        flex: 1 1 0;
    }

    .dashboard-main {
        padding: 8px;
        padding-bottom: 0px;
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

    .bdivider {
        border-bottom: 1px solid #cfcfcf;
        margin-top: 16px;
        margin-bottom: 16px;
    }

    @media (max-width: 920px) {
        .sidebar {
            display: none;
        }
    }
</style>
