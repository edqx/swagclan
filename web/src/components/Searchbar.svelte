<script>
    import SearchIcon from "$lib/icons/SearchIcon.svg";

    export let value = "";
</script>

<div class="search-bar">
    <div class="search-bar-icon">
        <slot name="icon">
            <SearchIcon src="/SearchIcon.svg" width={20}/>
        </slot>
    </div>
    <input class="search-bar-input" bind:value/>
</div>

<style>
    .search-bar {
        display: inline-flex;
        align-items: center;
        background-color: var(--dark-card1);
        border-radius: 8px;
        border: none;
        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.5);
        padding: 12px;
        background-repeat: no-repeat;
        width: 100%;
    }

    .search-bar-icon {
        padding-right: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .search-bar-input {
        flex: 1 1 0;
        background: transparent;
        border-radius: 0px;
        border: none;
        outline: none;
        box-shadow: none;
        padding: 0px;
        padding-left: 4px;
        background-repeat: no-repeat;
        color: #d3d3d3;
    }

    @media (max-width: 920px) {
        .search-bar-input {
            font-size: 18px;
        }
    }

    @media (max-width: 400px) {
        .search-bar {
            width: 200px;
        }
    }
</style>
