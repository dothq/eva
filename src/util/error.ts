import { ColorResolvable, MessageEmbed } from "discord.js";
import { Ctx } from "../commands";
import { l10n } from "../main";

export const replyWithError = (ctx: Ctx, l10nId: string, l10nCtx: any) => {
    const msg = l10n.t(ctx, `${l10nId}-error`, l10nCtx);
    const colour = l10n.t(ctx, "error-colour");

    const embed = new MessageEmbed()
        .setTitle(`❗ ${msg}`)
        .setColor(colour);

    ctx.reply({
        embeds: [embed],
        ephemeral: true
    });
}