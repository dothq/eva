import { MessageActionRow, MessageEmbed, Modal, ModalActionRowComponent, TextInputComponent, ThreadChannel } from "discord.js";
import { Action } from ".";
import { Ctx } from "../commands";
import { accentColour, l10n, settings } from "../main";
import { replyWithError } from "../util/error";

export const setThreadTitle = (ctx: Ctx, newTitle: string) => {
    const channel = ctx.channel as ThreadChannel;

    if (newTitle && newTitle.length) {
        channel.setName(`❓️ ・ ${newTitle}`);

        const embed = new MessageEmbed()
            .setTitle(`✅ ${l10n.t(ctx, `support-updated-thread-title`)}`)
            .setColor(accentColour);

        ctx.reply({
            embeds: [embed],
            ephemeral: true
        });
    } else {
        return replyWithError(ctx, "support-failed-thread-title-update").send();
    }
}

class RenameThreadAction extends Action {
    public constructor() {
        super("rename-thread");
    }

    public async exec(ctx: Ctx) {
        switch (ctx.type) {
            case "APPLICATION_COMMAND":
            case "MESSAGE_COMPONENT":
                const channel = ctx.channel as ThreadChannel;

                if (channel.type !== "GUILD_PUBLIC_THREAD") {
                    return replyWithError(ctx, "support-not-valid-support-thread").send()
                }

                const isParentSupportChannel = await settings.get(`bot.support_channels.${channel.parentId}`);

                if (!isParentSupportChannel) {
                    return replyWithError(ctx, "support-not-valid-support-thread").send()
                };

                const modal = new Modal()
                    .setCustomId("rename-thread")
                    .setTitle("Rename Thread");
        
                const title = new TextInputComponent()
                    .setCustomId("rename-thread-modal-title")
                    .setLabel("New thread title")
                    .setStyle("SHORT");
        
                const row = new MessageActionRow<ModalActionRowComponent>().addComponents(title);
                modal.addComponents(row);
        
                await ctx.showModal(modal);

                break;
            case "MODAL_SUBMIT":
                const newTitle = ctx.fields.getTextInputValue("rename-thread-modal-title");

                setThreadTitle(ctx, newTitle);

                break;
        }
    }
}

export default new RenameThreadAction();