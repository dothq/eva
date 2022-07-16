import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { MessageEmbed } from "discord.js";
import type { TextChannel } from "discord.js";
import { ChatCommand, Ctx } from "..";
import { accentColour, l10n } from "../../main";
import { Permissions } from "../../util/permissions";

class PurgeCommand extends ChatCommand {
	public constructor() {
		super("purge", {
			description: "🔥 Purge messages - (Administrative)",
            permissions: [
                Permissions.MANAGE_MESSAGES
            ],
			args: [
				{
					name: "number_of_messages",
					description: "Number of messages",
					type: ApplicationCommandOptionType.Integer,
					required: true,
				},
				{
					name: "from_user",
					description: "From a specific user",
					type: ApplicationCommandOptionType.User,
				},
				{
					name: "from_role",
					description: "From a specific role",
					type: ApplicationCommandOptionType.Role,
				},
				{
					name: "in_channel",
					description: "In channel",
					type: ApplicationCommandOptionType.Channel,
				},
			],
		});
	}

	public async exec(ctx: Ctx) {
		const messageAmount = parseInt(
			ctx.options.get("number_of_messages")!.value as string
		) as number;
		const channel: TextChannel = (await ctx.client.channels.cache.get(
			ctx.channelId
		)) as TextChannel;
		channel.bulkDelete(messageAmount);

        const embed = new MessageEmbed()
            .setColor(accentColour)
            .setTitle("✅ " + l10n.t(ctx, "purged-chat-messages", { count: messageAmount }))

		ctx.reply({
            embeds: [embed],
			ephemeral: true,
		});
	}
}

export default new PurgeCommand();
