import {
	APIApplicationCommandBasicOption,
	ApplicationCommandOptionType,
} from "discord-api-types/v10";
import { MessageEmbed, TextChannel } from "discord.js";
import { ChatCommand, Ctx } from "..";
import { accentColour, l10n, settings } from "../../main";
import { replyWithError } from "../../util/error";
import { hasPermission } from "../../util/permissions";

const ruleManagementOptions: APIApplicationCommandBasicOption[] = [
	{
		name: "id",
		description: "ID",
		type: ApplicationCommandOptionType.String,
		required: true,
	},
	{
		name: "name",
		description: "Name",
		type: ApplicationCommandOptionType.String,
		required: true,
	},
	{
		name: "description",
		description: "Description",
		type: ApplicationCommandOptionType.String,
		required: true,
	},
];

class RuleCommand extends ChatCommand {
	public constructor() {
		super("rule", {
			description: "Rule",
			args: [
				{
					name: "add",
					description: "➕ Add a rule",
					type: 1,
					options: ruleManagementOptions,
				},
				{
					name: "remove",
					description: "➖ Remove a rule",
					type: 1,
					options: [ruleManagementOptions[0]],
				},
				{
					name: "edit",
					description: "✏️ Edit a rule",
					type: 1,
					options: ruleManagementOptions,
				},
				{
					name: "list",
					description: "📄 View all rules",
					type: 1,
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

		// await require2FA(ctx);

		const subcommand = ctx.options.data[0].name as string;
		if (!subcommand) return;

		const rulesChannel = await settings.get("bot.moderation.rules.channel");

		switch (subcommand) {
			case "add":
				if (!rulesChannel)
					return replyWithError(ctx, "no-rules-channel").send();

				const ruleID = ctx.options.get("id", true).value;
				const ruleName = ctx.options.get("name", true).value;
				const ruleDescription = ctx.options.get(
					"description",
					true
				).value;

				if (!ruleID || !ruleName || !ruleDescription)
					return replyWithError(ctx, "missing-rule-info").send();
				const ruleEmbed = new MessageEmbed()
					.setColor(accentColour)
					.setTitle(ruleName as string)
					.setDescription(ruleDescription as string);
				const message = await (
					ctx.client.channels.cache.get(rulesChannel) as TextChannel
				)?.send({ embeds: [ruleEmbed] });

				await settings.set(`bot.moderation.rules.${ruleID}`, {
					name: ruleName,
					description: ruleDescription,
					messageID: message.id,
				});

				const addedEmbed = new MessageEmbed()
					.setColor(accentColour)
					.setTitle("✅ " + l10n.t(ctx, "rule-add-success"));

				await ctx.reply({ embeds: [addedEmbed], ephemeral: true });

				break;

			case "remove":
				const ruleIDToRemove = ctx.options.get("id", true).value;

				if (!ruleIDToRemove)
					return replyWithError(ctx, "missing-rule-id").send();

				const rule = await settings.get(
					`bot.moderation.rules.${ruleIDToRemove}`
				);

				if (!rule) return replyWithError(ctx, "rule-not-found").send();

				await settings.delete(`bot.moderation.rules.${ruleIDToRemove}`);

				const messageToDelete = await (
					ctx.client.channels.cache.get(rulesChannel) as TextChannel
				)?.messages.fetch(rule.messageID);

				messageToDelete?.delete();

				const removedEmbed = new MessageEmbed()
					.setColor(accentColour)
					.setTitle("✅ " + l10n.t(ctx, "rule-remove-success"));

				await ctx.reply({ embeds: [removedEmbed], ephemeral: true });

				break;

			case "edit":
				const ruleIDToEdit = ctx.options.get("id", true).value;

				if (!ruleIDToEdit)
					return replyWithError(ctx, "missing-rule-id").send();

				const ruleToEdit = await settings.get(
					`bot.moderation.rules.${ruleIDToEdit}`
				);

				if (!ruleToEdit)
					return replyWithError(ctx, "rule-not-found").send();

				const newRuleName = ctx.options.get("name", true).value;
				const newRuleDescription = ctx.options.get(
					"description",
					true
				).value;

				if (!newRuleName || !newRuleDescription)
					return replyWithError(ctx, "missing-rule-info").send();

				const newRuleEmbed = new MessageEmbed()
					.setColor(accentColour)
					.setTitle(newRuleName as string)
					.setDescription(newRuleDescription as string);

				const messageEdit = await (
					ctx.client.channels.cache.get(rulesChannel) as TextChannel
				)?.messages.fetch(ruleToEdit.messageID);

				await messageEdit?.edit({ embeds: [newRuleEmbed] });

				await settings.set(`bot.moderation.rules.${ruleIDToEdit}`, {
					name: newRuleName,
					description: newRuleDescription,
					messageID: messageEdit?.id,
				});

				const editedEmbed = new MessageEmbed()
					.setColor(accentColour)
					.setTitle("✅ " + l10n.t(ctx, "rule-edit-success"));

				await ctx.reply({ embeds: [editedEmbed], ephemeral: true });

				break;

			default:
				break;
		}
	}
}

export default new RuleCommand();
