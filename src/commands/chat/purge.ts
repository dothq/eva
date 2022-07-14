import { MessageEmbed } from "discord.js";
import { ChatCommand, Ctx } from "..";
import { Permissions } from "../../util/permissions";
import { accentColour } from "../../main";
import { ApplicationCommandOptionType } from "discord-api-types/v10"
import { ChannelTypes } from "discord.js/typings/enums";

class PurgeCommand extends ChatCommand {
    public constructor() {
        super("purge", {
            description: "🔥 Purge messages - (Administrative)",
            roles: [

            ],
            args: [
                {
                    name: "number_of_messages",
                    description: "Number of messages",
                    type: ApplicationCommandOptionType.Integer,
                    required: true
                },
                {
                    name: "from_user",
                    description: "From a specific user",
                    type: ApplicationCommandOptionType.User
                },
                {
                    name: "from_role",
                    description: "From a specific role",
                    type: ApplicationCommandOptionType.Role
                },
                {
                    name: "in_channel",
                    description: "In channel",
                    type: ApplicationCommandOptionType.Channel
                }
            ]
        });
    }

    public async exec(ctx: Ctx) {
    
    }
}

export default new PurgeCommand();