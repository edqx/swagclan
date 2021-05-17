import { BasicGuild } from "@wilsonjs/models";
import { ScApiBasicGuildPremium } from "./GuildPremium";

export interface ScApiBasicGuild extends BasicGuild {
    premium?: ScApiBasicGuildPremium;
}
