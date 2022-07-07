import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { MessageEmbed } from "discord.js";
import { ChatCommand, Ctx } from "..";
import { accentColour, l10n } from "../../main";
import { replyWithError } from "../../util/error";
import { Permissions } from "../../util/permissions";

class UsernameCommand extends ChatCommand {
    public constructor() {
        super("username", {
            description: "🏷️ Set the bot's username - (Administrative)",
            permissions: [
                Permissions.MANAGE_GUILD
            ],
            args: [
                {
                    name: "name",
                    description: "Name",
                    type: ApplicationCommandOptionType.String
                },
                {
                    name: "use_guild_name",
                    description: "Use guild name",
                    type: ApplicationCommandOptionType.Boolean
                }
            ]
        });
    }

    public async exec(ctx: Ctx) {
        let name = "";

        if (ctx.options.data.length > 1) {
            return replyWithError(
                ctx, 
                "too-many-options-picked", 
                { 
                    optionSize: ctx.options.data.length, 
                    expectedOptionSize: 1 
                }
            ).send();
        }

        if (ctx.options.get("name")) {
            name = ctx.options.get("name")?.value as any;
        } else if (ctx.options.get("use_guild_name")) {
            name = ctx.guild?.name as string;
        } else {
            return replyWithError(ctx, "no-option-picked").send();
        }

        await ctx.client.user?.setUsername(name);

        const embed = new MessageEmbed()
            .setColor(accentColour)
            .setTitle("✅ " + l10n.t(ctx, "updated-username-message", { botname: ctx.client.user?.username }))

        ctx.reply({
            embeds: [embed],
            ephemeral: true
        })
    }
}

export default new UsernameCommand();