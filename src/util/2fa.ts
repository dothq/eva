import { MessageEmbed } from "discord.js";
import twoFactorModal from "../actions/two-factor-modal";
import { Ctx } from "../commands";
import { settings } from "../main";
import { replyWithError } from "./error";

export const require2FA = async (ctx: Ctx) => {
    const has2FASetup = await settings.get(`bot.security.2fa.${ctx.user.id}`);

    if (!has2FASetup) {
        return replyWithError(ctx, "2fa-not-setup").send();
    }

    const hasSession = await settings.get(`bot.sessions.${ctx.user.id}`);

    if (!hasSession) {
        await twoFactorModal.exec(ctx);
    }
}