import { ApplicationCommandOptionType } from "discord-api-types/v10";
import type { GuildMember } from "discord.js";
import { ChatCommand, Ctx } from "..";

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
		member?.kick();
	}
}

export default new KickCommand();
