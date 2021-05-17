
<script lang="ts">
    import type { BasicGuild } from "@wilsonjs/models";

    import { getContext } from "svelte";

    const guild: BasicGuild = getContext("guild");
</script>

<svelte:head>
    {#if guild}
        <title>{guild.name} | My Servers | SwagClan</title>
    {:else}
        <title>Loading.. | My Servers | SwagClan </title>
    {/if}
</svelte:head>

{#if guild}
    <span class="guild-name">
        {guild.name}
    </span>
    <br>
    {#if guild.approximate_member_count}
        <span class="guild-members">{guild.approximate_member_count} Member{guild.approximate_member_count === 1 ? "" : "s"}</span>
    {/if}
{/if}