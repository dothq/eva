import { MessageActionRow, MessageButton, MessageEmbed, MessageSelectMenu, ThreadChannel, MessageSelectOption, MessageButtonOptions, MessageActionRowComponent } from "discord.js";
import { ChannelTypes } from "discord.js/typings/enums";
import { Action } from ".";
import { Ctx } from "../commands";
import { accentColour, l10n, settings, threadCreateEmbed } from "../main";
import { replyWithError } from "../util/error";

class CloseThreadAction extends Action {
    public constructor() {
        super("close-thread");
    }

    public async exec(ctx: Ctx) {
        const channel = ctx.channel as ThreadChannel;

        if (channel.type !== "GUILD_PUBLIC_THREAD") {
            return replyWithError(ctx, "support-not-valid-support-thread").send()
        }

        const isParentSupportChannel = await settings.get(`bot.support_channels.${channel.parentId}`);

        if (!isParentSupportChannel) {
            return replyWithError(ctx, "support-not-valid-support-thread").send()
        };

        channel.setName(`✅` + channel.name.substring(1));

        const embed = new MessageEmbed()
            .setTitle(`✅ This thread has been marked as solved.`)
            .setColor(accentColour)

        const users = (await channel.messages.fetch())
            .filter(m => !m.author.bot)
            .filter(m => m.author.id !== ctx.user.id)
            .map(m => ({
                ...m.author || {},
                ...m.member || {}
            }));

        const msg = await ctx.channel?.messages.fetch(ctx.message.id);
        
        if (msg) {
            msg.edit({
                embeds: [threadCreateEmbed()],
                components: []
            });
        }

        if (users.length) {
            await channel.send({
                embeds: [embed]
            });

            const feedbackEmbed = new MessageEmbed()
                .setTitle(`👍️ ` + l10n.t(ctx, `support-thread-closed-feedback`))
                .setDescription(l10n.t(ctx, `support-thread-closed-feedback-description`))
                .setColor(accentColour);

            const row = new MessageActionRow();

            for await (const u of users) {
                if (!row.components.find(m => m.customId == `thread-user-feedback-submit-${u.id}`)) {
                    const btn = {
                        customId: `thread-user-feedback-submit-${u.id}`,
                        label: u.nickname || u.username,
                        style: "SECONDARY"
                    }
    
                    row.components.push(btn as MessageActionRowComponent);
                }
            }

            ctx.reply({
                embeds: [feedbackEmbed],
                components: [
                    row,
                    new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setCustomId(`thread-user-feedback-submit`)
                                .setLabel(`Submit feedback`)
                                .setEmoji(`📨`)
                                .setStyle("SECONDARY")
                        )
                ],
                ephemeral: true
            })

            setTimeout(async () => {
                await channel.setArchived(true);
            }, 60000);
        } else {
            ctx.reply({
                embeds: [embed]
            });

            await channel.setArchived(true);
        }
    }
}

export default new CloseThreadAction();