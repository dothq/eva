import axios from "axios";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { MessageEmbed } from "discord.js";
import { ChatCommand, Ctx } from "..";
import { accentColour, calculateDominantColour, l10n } from "../../main";
import { replyWithError } from "../../util/error";
import { Permissions } from "../../util/permissions";

class AvatarCommand extends ChatCommand {
    public constructor() {
        super("avatar", {
            description: "🖼️ Set the bot's avatar - (Administrative)",
            permissions: [
                Permissions.MANAGE_GUILD,
                Permissions.BAN_MEMBERS
            ],
            args: [
                {
                    name: "file",
                    description: "Avatar file",
                    type: ApplicationCommandOptionType.Attachment
                },
                {
                    name: "file_url",
                    description: "Avatar URL",
                    type: ApplicationCommandOptionType.String
                },
                {
                    name: "use_guild_icon",
                    description: "Use guild icon",
                    type: ApplicationCommandOptionType.Boolean
                }
            ]
        });
    }

    public async exec(ctx: Ctx) {
        let file_url = "";
        let file_buffer = Buffer.from("");

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

        if (ctx.options.get("file")) {
            file_url = ctx.options.get("file")?.attachment?.url as string;
        } else if (ctx.options.get("file_url")) {
            file_url = ctx.options.get("file_url")?.value as string;
        } else if (ctx.options.get("use_guild_icon")) {
            file_url = ctx.guild?.iconURL({ format: "png" }) as string;
        } else {
            return replyWithError(ctx, "no-option-picked").send();
        }

        if (!file_url.length) {
            return replyWithError(ctx, "no-option-picked").send();
        }

        try {
            const res = await axios.get(file_url, { responseType: "arraybuffer" });
            file_buffer = res.data;
        } catch(e) {
            return replyWithError(ctx, "option-parse-failed").send();
        }

        if (file_buffer) {
            await ctx.client.user?.setAvatar(file_buffer);
            await calculateDominantColour(ctx.client);
        }

        const embed = new MessageEmbed()
            .setColor(accentColour)
            .setTitle("✅ " + l10n.t(ctx, "updated-avatar-message", { botname: ctx.client.user?.username }))

        ctx.reply({
            embeds: [embed],
            ephemeral: true
        })
    }
}

export default new AvatarCommand();