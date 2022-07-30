import { MessageEmbed } from "discord.js";
import twoFactorModal from "../actions/two-factor-modal";
import { Ctx } from "../commands";
import { settings } from "../main";
import { replyWithError } from "./error";

export const require2FA = async (ctx: Ctx, callback?: (ctx: Ctx) => void) => {
    const has2FASetup = await settings.get(`bot.security.2fa.${ctx.user.id}`);

    if (!has2FASetup) {
        return replyWithError(ctx, "2fa-not-setup").send();
    }

    const hasSession = await settings.get(`bot.otpsessions.${ctx.user.id}`);

    if (typeof hasSession == "undefined") {
        await twoFactorModal.exec(ctx, callback);

        return true;
    } else if (hasSession <= Date.now()) {
        await settings.delete(`bot.otpsessions.${ctx.user.id}`);

        await twoFactorModal.exec(ctx, callback);

        return true;
    } else {
        if (callback) callback(ctx);

        return true;
    }
}