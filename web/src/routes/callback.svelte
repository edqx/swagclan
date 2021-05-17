<script context="module">
     export async function load({ page, fetch, session, context }) {
        const guildid = page.query.get("guild_id");

        return {
            status: 302,
            redirect: "/servers/" + guildid
        };
	}
</script>

Redirecting.all.a.ab.abab.ab.ab