import { MessageEmbed } from "discord.js";
import { Ctx, MessageCommand } from "..";
import { accentColour, DEFAULT_AVATAR, l10n, log } from "../../main";
import { replyWithError } from "../../util/error";

class ReportCommand extends MessageCommand {
    public constructor() {
        super("Report Message...")
    }

    public async exec(ctx: Ctx) {
        const messageId = ctx.targetId;

        const msg = await ctx.channel?.messages.fetch(messageId);

        if (!msg) {
            return replyWithError(ctx, "unknown-message").send();
        }

        const embed = new MessageEmbed()
            .setColor(accentColour)
            .setTitle(`❓ ${l10n.t(ctx, "confirm-report-title-msg")}`)
            .setDescription(l10n.t(ctx, "confirm-report-description-msg"))
            .setFooter({
                text: l10n.t(ctx, "confirm-report-author-footer-msg", { tag: msg.author.tag, id: msg.author.id }),
                iconURL: msg.author.avatarURL() || DEFAULT_AVATAR
            })

        if (msg.content && msg.content.length) {
            embed.addField(l10n.t(ctx, "confirm-report-msg-content-field-msg"), `\`\`\`${msg.content}\`\`\``)
        }

        embed.addField(l10n.t(ctx, "confirm-report-msg-sent-field-msg"), `<t:${msg.createdAt.getTime()/1000|0}>`, true)
        embed.addField(l10n.t(ctx, "confirm-report-msg-id-field-msg"), `\`${msg.id}\``, true)

        if (msg.attachments.size) {
            embed.setImage(msg.attachments.first()?.url as any);

            embed.addField(
                l10n.t(ctx, "confirm-report-msg-attachments-field-msg"), 
                msg.attachments.map(a => `[\`${a.name}\`](${a.url})`).join("\n")
            );
        }

        ctx.reply({
            embeds: [embed],
            ephemeral: true
        })
    }
}

export default new ReportCommand();