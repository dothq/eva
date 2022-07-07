import { MessageEmbed } from "discord.js";
import { Action } from ".";
import { Ctx } from "../commands";
import { accentColour, l10n } from "../main";

class ReceiveReportAction extends Action {
    public constructor() {
        super("receive-report");
    }

    public async exec(ctx: Ctx) {
        const embed = new MessageEmbed()
            .setColor(accentColour)
            .setTitle("✅ " + l10n.t(ctx, "report-submitted-title"))

        ctx.reply({
            embeds: [embed],
            ephemeral: true
        });
    }
}

export default new ReceiveReportAction();