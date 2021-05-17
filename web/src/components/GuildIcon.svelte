<script lang="ts">
    import type { BasicGuild } from "@wilsonjs/models";

    export let guild: BasicGuild;
    export let size;
</script>

{#if guild?.icon}
    <img class="guild-icon" src="https://cdn.discordapp.com/icons/{guild?.id}/{guild?.icon}.png" alt={guild?.name}/ width={size} height={size}>
{:else}
    <div class="fake-icon" style="width: {size}px; height: {size}px;">{guild?.name?.replace(/(?<=\w)\w+| /g, "") || ""}</div>
{/if}

<style>
    .guild-icon, .fake-icon {
        border-radius: 50%;
    }

    .fake-icon {
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 24px;
        background-color: #5865f2;
    }
</style>