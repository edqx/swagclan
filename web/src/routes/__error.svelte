<script context="module">
	export function load({ error, status }) {
		return {
			props: {
				error,
                status
			}
		};
	}
</script>

<script>
    import { dev } from "$app/env";

    export let status;
    export let error;

    const messages = {
        400: "A bad request was made, go back to your last site or contact a site administrator if you're unsure.",
        401: "You are unauthorized to view this page. Try logging in, or, if you believe this is an error, contact a site admin.",
        403: "You are forbidden from viewing this page, if you believe this is an error, contact a site admin.",
        404: "You must have taken a broken link, the page you requested doesn't exist.",
        500: "The server encountered an internal error, please contact a site administrator."
    };
</script>

<div class="error-info">
    <span class="error-code">
        {status}
    </span>
    {#if dev}
        {error.message}
    {:else}
        {messages[status] || "Please contact a site administrator for more information."}
    {/if}
    <a class="homepage-link" href="/">
        Click here to go to the homepage
    </a>
</div>

<style>
    .error-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1 1 0;
        padding: 24px;
    }

    .error-code {
        font-size: 82px;
    }

    .homepage-link {
        margin-top: 24px;
    }
</style>
