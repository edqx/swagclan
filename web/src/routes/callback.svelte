<script context="module">
    import { browser } from "$app/env";
    import { goto } from "$app/navigation";
    import * as swagclan from "$lib/api";

    export async function load({ page, fetch, session, context }) {
        const guildid = page.query.get("guild_id");
        const state = JSON.parse(page.query.get("state"));

        if (state.type === "dashboard") {
            return {
                status: 302,
                redirect: "/servers/" + guildid
            };
        } else {
            return {
                props: {
                    guildid,
                    state
                }
            };
        }
	}
</script>

<script>
    export let guildid;
    export let state;

    if (browser && state) {
        if (state.type === "create-command") {
            if (!state.command_id || !state.command_version) {

            }

            const redirect = state.redirect || ("/servers/" + guild.id + "/commands/" + command.id);

            swagclan.createGuildCommand(guildid, {
                command_id: state.command_id,
                command_version: state.command_version,
                enabled: true,
                timeout: 0,
                config: {},
                permissions: []
            }).then(() => {
                goto(redirect);
            }).catch(e => {
                goto("/commands/" + state.command_id + "/select-server?v=" + state.command_version + "&r=" + redirect + "&e=" + e.details);
            });
        }
    }
</script>
