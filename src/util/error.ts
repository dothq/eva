import { ColorResolvable, MessageEmbed } from "discord.js";
import { Ctx } from "../commands";
import { l10n } from "../main";

export const replyWithError = (ctx: Ctx, l10nId: string, l10nCtx?: any) => {
    const msg = l10n.t(ctx, `error-${l10nId}`, l10nCtx);
    const colour = l10n.t(ctx, "error-colour");

    const embed = new MessageEmbed()
        .setTitle(`❗ ${msg}`)
        .setColor(colour);

    return {
        embed,
        send: function (ephemeral: boolean = true) {
            ctx.reply({
                embeds: [this.embed],
                ephemeral
            });
        }
    }
}