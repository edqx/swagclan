<script>
    import { createEventDispatcher } from "svelte";
    import { GuildFeature } from "@wilsonjs/constants";

    import VerifiedIcon from "$lib/icons/VerifiedIcon.svg";
    import GoIcon from "$lib/icons/GoIcon.svg";

    import Searchbar from "$components/Searchbar.svelte";
    import GuildIcon from "$components/GuildIcon.svelte";

    const dispatch = createEventDispatcher();

    export let guilds;

    let search_term = "";
    let found_guilds = [];
    $: found_guilds = search_term ? guilds.filter(guild => {
        return guild.name.toLowerCase()
            .replace(/\W/g, "")
            .indexOf(
                search_term.toLowerCase()
                .replace(/\W/g, "")
            ) > -1;
    }) : guilds;

    $: found_guilds = found_guilds.sort((a, b) => {
        return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
    });
</script>

<div class="guild-list-wrapper">
    <div class="search-guilds">
        <Searchbar bind:value={search_term}/>
        <span class="num-results">{found_guilds.length}&nbsp;Result{found_guilds.length === 1 ? "" : "s"}</span>
    </div>

    <div class="guild-list">
        {#each found_guilds as guild}
            <div class="guild">
                <GuildIcon {guild} size={64}/>
                <div class="guild-info">
                    <span class="guild-name">
                        {guild.name}
                        {#if guild.premium}
                            <br>
                            <span class="premium">PREMIUM</span>
                        {/if}
                    </span>
                </div>
                <div class="guild-tags">
                    {#if guild.features.includes(GuildFeature.Verified)}
                        <VerifiedIcon width={20}/>
                    {/if}
                </div>
                <div class="guild-actions">
                    <a class="guild-action" on:click={() => dispatch("select", guild)}>
                        <slot name="icon">
                            <GoIcon width={30}/>
                        </slot>
                    </a>
                </div>
            </div>
        {/each}
    </div>
</div>

<style>
    .search-guilds {
        display: flex;
        align-items: center;
        margin: 8px;
        width: 650px;
    }

    .num-results {
        margin-left: 12px;
    }

    .guild-list {
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
    }

    .guild {
        background-color: var(--dark-card1);
        box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.5);
        margin: 8px;
        padding: 16px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        width: 650px;
    }

    .guild-info {
        display: flex;
        flex-direction: column;
        margin-left: 12px;
        margin-right: 4px;
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

    .guild-tags {
        display: flex;
    }

    .guild-actions {
        order: 2;
        margin-left: auto;
    }

    .guild-action {
        padding: 6px;
        padding-left: 6px;
        padding-right: 6px;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .guild-action:hover {
        background-color: rgba(255, 255, 255, 0.05);
    }

    @media (max-width: 920px) {
        .guild {
            width: auto;
        }

        .search-guilds {
            width: auto;
        }
    }
</style>
