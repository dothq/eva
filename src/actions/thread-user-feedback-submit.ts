import { MessageActionRow, MessageButton, MessageEmbed, ThreadChannel } from "discord.js";
import { Action } from ".";
import { Ctx } from "../commands";
import { accentColour, l10n } from "../main";

class ThreadUserFeedbackSubmitAction extends Action {
    public constructor() {
        super("thread-user-feedback-submit-");
    }

    public async exec(ctx: Ctx) {
        if (!ctx.message.components) return;

        const userId = ctx.customId.split(this.name)[1];

        console.log(userId);

        for (const c of ctx.message.components) {
            console.log(c)
        }

        ctx.update({
            embeds: [...ctx.message.embeds],
            components: ctx.message.components as any
        });
    }
}

export default new ThreadUserFeedbackSubmitAction();