import { ApplicationCommandOptionType } from "discord-api-types/v10";
import type { GuildMember } from "discord.js";
import { MessageEmbed } from "discord.js";
import { ChatCommand, Ctx } from "..";
import { accentColour, l10n, settings } from "../../main";
import { replyWithError } from "../../util/error";
import { hasPermission } from "../../util/permissions";

class BanCommand extends ChatCommand {
	public constructor() {
		super("ban", {
			description: "🔨 Ban a user - (Administrative)",
			permissions: ["BAN_MEMBERS"],
			args: [
				{
					name: "user",
					description: "User",
					type: ApplicationCommandOptionType.User,
					required: true,
				},
				{
					name: "reason",
					description: "Reason",
					type: ApplicationCommandOptionType.String,
					required: true,
				},
			],
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
			roles: [modRole],
		});

		const member = ctx.client.guilds.cache
			.get(ctx.guild?.id as string)
			?.members.cache.get(
				ctx.options.get("user")?.value as string
			) as GuildMember;

		if (ctx.options.get("user")?.value === ctx.user.id) {
			return replyWithError(ctx, "cannot-ban-self").send();
		} else if (ctx.options.get("user")?.value === ctx.client.user?.id) {
			return replyWithError(ctx, "cannot-ban-bot").send();
		}

		try {
			member?.ban({
				reason: ctx.options.get("reason")?.value as string,
			});
		} catch (err) {
			return replyWithError(ctx, "ban-failed-unknown").send();
		}

		const embed = new MessageEmbed().setColor(accentColour).setTitle(
			"✅ " +
				l10n.t(ctx, "ban-success", {
					user: member?.user?.tag,
					reason: ctx.options.get("reason")?.value,
				})
		);

		return ctx.reply({
			embeds: [embed],
			ephemeral: true,
		});
	}
}

export default new BanCommand();
