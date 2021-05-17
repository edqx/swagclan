<script context="module">
	export async function load({ page, fetch, session, context }) {
        return {
            error: 301,
            redirect: "/dashboard/servers"
        };
    }
</script>