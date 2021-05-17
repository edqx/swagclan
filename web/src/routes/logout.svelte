<script>
    import { onMount } from "svelte";
    import { VITE_BASE_API } from "$lib/env.js";

    import * as swagclan from "$lib/api";

    onMount(async () => {
        await swagclan.logout();
    });
</script>
