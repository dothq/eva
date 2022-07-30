import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { ChatCommand, Ctx } from "..";
import { settings } from "../../main";

class SetRulesChannelCommand extends ChatCommand {
	public constructor() {
		super("set-rules-channel", {
			description: "Set rule channel",
			args: [
				{
					name: "channel",
					description: "📝 Update the channel for the rules",
					type: ApplicationCommandOptionType.Channel,
				},
			],
		});
	}

	public async exec(ctx: Ctx) {
		const { channel } = ctx.options.get("channel", true);
		if (!channel) return;

		await settings.set("bot.moderation.rules.channel", channel?.id);

		ctx.reply({
			content: "Done.",
			ephemeral: true,
		});
	}
}

export default new SetRulesChannelCommand();
