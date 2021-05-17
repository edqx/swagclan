<script>
    import { onMount } from "svelte";
    import { VITE_BASE_API } from "$lib/env.js";
    import * as swagclan from "$lib/api";

    import GuildIcon from "$components/GuildIcon.svelte";

    export let guild;

    onMount(async () => {
        if (!guild.name) {
            try {
                guild = await swagclan.getGuild(guild.id);
            } catch (e) {
                console.log(e);
            }
        }
    });
</script>

<a href="/servers/{guild.id}" class="guild-preview">
    <GuildIcon {guild} size={32}/>
    <span class="guild-name">{guild?.name || "Loading.."}</span>
</a>

<style>
    .guild-preview {
        display: flex;
        color: #d3d3d3;
        align-items: center;
    }

    .guild-name {
        margin-left: 4px;
    }
</style>
