import { ApplicationCommandOptionType, ChannelType } from "discord-api-types/v10";
import { MessageEmbed } from "discord.js";
import { ChatCommand, Ctx } from "..";
import { accentColour, l10n, setRealmChannel, settings } from "../../main";
import { replyWithError } from "../../util/error";
import { Permissions } from "../../util/permissions";

class SetModRole extends ChatCommand {
    public constructor() {
        super("set-mod-role", {
            description: "🛠️ Set the moderator role - (Administrative)",
            permissions: [
                Permissions.ADMINISTRATOR
            ],
            args: [
                {
                    name: "role",
                    description: "Role",
                    type: ApplicationCommandOptionType.Role,
                    required: true
                }
            ]
        });
    }

    public async exec(ctx: Ctx) {
        const { role } = ctx.options.get("role", true);
        if (!role) return;

        await settings.set("bot.moderation.role", role?.id);

        ctx.reply({
            content: "Done.",
            ephemeral: true
        })
    }
}

export default new SetModRole();