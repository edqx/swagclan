<script>
    import { createEventDispatcher } from "svelte"

    export let toggled;

    const dispatch = createEventDispatcher();

    function onClick(e) {
        e.stopPropagation();
        e.preventDefault();

        toggled = !toggled;
        dispatch("change", toggled);
    }
</script>

<div class="toggle-switch-wrapper">
    <!-- svelte-ignore a11y-missing-attribute -->
    <a
        class="toggle-switch"
        class:toggled
        on:click={onClick}
    >
        <div class="ball" class:toggled></div>
    </a>
</div>

<style>
    .toggle-switch-wrapper {
        display: inline;
    }

    .toggle-switch {
        cursor: pointer;
        border-radius: 30px;
        height: 25px;
        width: 50px;
        background-color: var(--dark-bg);
        border: 1px solid var(--dark-link-hover);
        display: flex;
        align-items: center;
    }

    .toggle-switch.toggled {
        border: 1px solid var(--dark-link);
    }

    .ball {
        height: 19px;
        width: 19px;
        border-radius: 50%;
        margin-left: 3px;
        transition: margin-left .2s;
        background-color: var(--dark-link-hover)
    }

    .ball.toggled {
        margin-left: 28 px;
        background-color: var(--dark-link);
    }
</style>
