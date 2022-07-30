import { MessageActionRow, MessageButton, MessageEmbed, Modal, ModalActionRowComponent, TextInputComponent } from "discord.js";
import { totp } from "speakeasy";
import { Action } from ".";
import { Ctx } from "../commands";
import { accentColour, l10n, settings } from "../main";

class TwoFactorModalAction extends Action {
    public constructor() {
        super("two-factor-modal");
    }

    public async exec(ctx: Ctx, callback?: (ctx: Ctx) => void) {
        switch (ctx.type) {
            case "APPLICATION_COMMAND":
            case "MESSAGE_COMPONENT":
                const modal = new Modal()
                    .setCustomId("two-factor-modal")
                    .setTitle("Enter 2FA code from app");
        
                const code = new TextInputComponent()
                    .setCustomId("two-factor-code")
                    .setLabel("2FA Code")
                    .setStyle("SHORT");
        
                const row = new MessageActionRow<ModalActionRowComponent>().addComponents(code);
                modal.addComponents(row);
        
                await ctx.showModal(modal);

                break;
            case "MODAL_SUBMIT":
                const possibleCode = ctx.fields.getTextInputValue("two-factor-code").replace(/\s/g, "");
                const secret = await settings.get(`bot.security.2fa.${ctx.user.id}`);

                const verified = totp.verify({
                    secret,
                    encoding: "hex",
                    token: possibleCode
                });

                if (verified) {
                    await settings.set(`bot.otpsessions.${ctx.user.id}`, Date.now() + (60 * 1000 * 5));

                    if (callback) await callback(ctx);
                } else {
                    const row = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setCustomId("two-factor-modal")
                                .setLabel("Try again?")
                                .setStyle("PRIMARY")
                        )

                    ctx.reply({
                        content: "Code is invalid.",
                        components: [row],
                        ephemeral: true
                    })
                }

                break;
        }
    }
}

export default new TwoFactorModalAction();