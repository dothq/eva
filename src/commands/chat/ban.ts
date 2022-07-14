import axios from "axios";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { MessageEmbed } from "discord.js";
import { ChatCommand, Ctx } from "..";
import { accentColour, calculateDominantColour, l10n } from "../../main";
import { replyWithError } from "../../util/error";
import { Permissions } from "../../util/permissions";

class BanCommand extends ChatCommand {
    public constructor() {
        super("ban", {
            description: "🔨 Ban a user - (Administrative)",
            args: [
                {
                    name: "user",
                    description: "User",
                    type: ApplicationCommandOptionType.User
                },
                {
                    name: "reason",
                    description: "Reason",
                    type: ApplicationCommandOptionType.String
                },
            ]
        });
    }

    public async exec(ctx: Ctx) {
       
    }
}

export default new BanCommand();