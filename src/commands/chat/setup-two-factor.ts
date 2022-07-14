import { ApplicationCommandOptionType, ChannelType } from "discord-api-types/v10";
import { MessageAttachment, MessageActionRow, MessageButton } from "discord.js";
import speakeasy from "speakeasy";
import { ChatCommand, Ctx } from "..";
import { accentColour, l10n, setRealmChannel, settings } from "../../main";
import { replyWithError } from "../../util/error";
import { hasPermission, Permissions } from "../../util/permissions";
import qr from "qrcode";

class SetupTwoFactorCommand extends ChatCommand {
    public constructor() {
        super("setup-two-factor", {
            description: "🔐 Setup two-factor authentication for this account - (Administrative)"
        });
    }

    public async exec(ctx: Ctx) {
        const modRoleId = await settings.get("bot.moderation.role");

        if (!modRoleId) {
            return replyWithError(ctx, "no-mod-role").send();
        }

        const modRole = await ctx.guild?.roles.fetch(modRoleId);

        if (!modRole) {
            return replyWithError(ctx, "no-mod-role").send();
        }

        await hasPermission(ctx, {
            roles: [modRole]
        });

        const secret = speakeasy.generateSecret({ name: "Dot Community Admins", length: 64 });

        await settings.set(`bot.security.2fa.${ctx.user.id}`, secret.hex);

        const qrcode = await qr.toBuffer(secret.otpauth_url as string);
        const attachment = new MessageAttachment(qrcode, "qrcode.png");

        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId("two-factor-modal")
                    .setLabel("Continue")
                    .setStyle("PRIMARY")
            )

        ctx.reply({
            content: "1. Download a 2FA authenticator app, ideally any from the list at privacytools.io/#2fa.\n\n2. Open the app and scan this QR code.\n\n3. Then input the 6 digit code provided by the 2FA app.",
            ephemeral: true,
            files: [attachment],
            components: [row]
        });
    }
}

export default new SetupTwoFactorCommand();