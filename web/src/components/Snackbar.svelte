<script>
    import { fly, fade } from "svelte/transition";

    export let open;

    let timeout = null;
    let is_open = false;

    export let close;

    close = () => {
        is_open = false;
        clearTimeout(timeout)
    }

    $: if (open) {
        open = false;
        is_open = true;
        clearTimeout(timeout);

        timeout = setTimeout(() => {
            is_open = false;
        }, 3000);
    }
</script>

{#if is_open}
    <div in:fly={{ y: 50, duration: 500 }} out:fade class="snackbar">
        <slot></slot>
    </div>
{/if}

<style>
    .snackbar {
        z-index: 6;
        position: fixed;
        left: 50%;
        bottom: 0px;
        transform: translate(-50%, -50%);
        background-color: var(--dark-card1);
        box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.5);
        padding: 8px;
        border-radius: 8px;
        display: flex;
        align-items: center;
    }
</style>
