import { ApplicationCommandOptionType } from "discord-api-types/v10";
import type { GuildMember } from "discord.js";
import { MessageEmbed } from "discord.js";
import { ChatCommand, Ctx } from "..";
import { accentColour, l10n } from "../../main";
import { replyWithError } from "../../util/error";

class KickCommand extends ChatCommand {
	public constructor() {
		super("kick", {
			description: "🔨 Kick a user - (Administrative)",
			args: [
				{
					name: "user",
					description: "User",
					type: ApplicationCommandOptionType.User,
				},
				{
					name: "reason",
					description: "Reason",
					type: ApplicationCommandOptionType.String,
				},
			],
		});
	}

	public async exec(ctx: Ctx) {
		const member = ctx.client.guilds.cache
			.get(ctx.guild?.id as string)
			?.members.cache.get(
				ctx.options.get("user")?.value as string
			) as GuildMember;

		if (ctx.options.get("user")?.value === ctx.user.id) {
			return replyWithError(ctx, "cannot-kick-self").send();
		} else if (ctx.options.get("user")?.value === ctx.client.user?.id) {
			return replyWithError(ctx, "cannot-kick-bot").send();
		}

		try {
			member?.kick();
		} catch (err) {
			return replyWithError(ctx, "kick-failed-unknown").send();
		}

		const embed = new MessageEmbed().setColor(accentColour).setTitle(
			"✅ " +
				l10n.t(ctx, "kick-success", {
					user: member?.user?.tag,
					reason: ctx.options.get("reason")?.value,
				})
		);
	}
}

export default new KickCommand();
