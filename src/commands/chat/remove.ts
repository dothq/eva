import axios from "axios";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { MessageEmbed, User, VoiceChannel } from "discord.js";
import { ChatCommand, Ctx } from "..";
import { accentColour, calculateDominantColour, l10n, settings } from "../../main";
import { replyWithError } from "../../util/error";
import { Permissions } from "../../util/permissions";

class RemoveCommand extends ChatCommand {
    public constructor() {
        super("remove", {
            description: "👥 Remove user from your space",
            args: [
                {
                    name: "user",
                    description: "User",
                    type: ApplicationCommandOptionType.User,
                    required: true
                }
            ]
        });
    }

    public async exec(ctx: Ctx) {
        const { user } = ctx.options.get("user", true);
        if (!user) return;

        const userMember = await ctx.guild?.members.fetch(user.id);
        const member = await ctx.guild?.members.fetch(ctx.user.id);
        if (!member) return;
        if (!userMember) return;

        const voiceID = await settings.get("bot.realms.vc_channel");
        const categoryId = await settings.get("bot.realms.category_channel");

        const vc = member.voice.channel;
        if (!vc) return replyWithError(ctx, "realms-not-in-channel").send();
        if (vc.id == voiceID) return replyWithError(ctx, "realms-joined-realm-channel-meta-incorrect-usage").send();
        if (vc?.parentId !== categoryId) return replyWithError(ctx, "realms-not-in-channel").send();

        if (!userMember.voice.channel) return replyWithError(ctx, "realms-user-not-in-channel").send();
        if (userMember.voice.channelId !== vc.id) return replyWithError(ctx, "realms-user-not-in-channel").send();
        if (!vc.permissionsFor(member).has("MOVE_MEMBERS")) return replyWithError(ctx, "realms-cant-remove-user").send();

        await vc.permissionOverwrites.create(user, {
            CONNECT: false
        });

        await userMember.voice.disconnect();

        const embed = new MessageEmbed()
            .setColor(accentColour)
            .setTitle("👍️ " + l10n.t(ctx, "realms-removed-user", { username: user.username }));

        ctx.reply({
            embeds: [embed],
            ephemeral: true
        })
    }
}

export default new RemoveCommand();