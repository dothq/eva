import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { MessageEmbed } from "discord.js";
import type { TextChannel } from "discord.js";
import { ChatCommand, Ctx } from "..";
import { accentColour, l10n, settings } from "../../main";
import { hasPermission, Permissions } from "../../util/permissions";
import { replyWithError } from "../../util/error";
import { require2FA } from "../../util/2fa";

class StrikeCommand extends ChatCommand {
	public constructor() {
		super("strike", {
			description: "🎟️ Strike a user for an action - (Administrative)",
			args: [
				{
					name: "user",
					description: "User",
					type: ApplicationCommandOptionType.User,
					required: true,
				},
                {
					name: "reason",
					description: "Reason for infraction",
					type: ApplicationCommandOptionType.String,
					required: true,
                    choices: [
                        {
                            name: "Hate speech",
                            value: "hate_speech"
                        },
                        {
                            name: "Unsolicited advertisement",
                            value: "unsolicited_advertisement"
                        },
                        {
                            name: "Overly sexualised conversation/imagery",
                            value: "nsfw_content"
                        },
                        {
                            name: "Heated/uncivil argument/debate",
                            value: "heated_argument"
                        },
                        {
                            name: "Attempted DDoS/Dox threat",
                            value: "ddos_dox_threats"
                        },
                        {
                            name: "Involvement in raid",
                            value: "raid_involvement"
                        },
                        {
                            name: "Mass pings",
                            value: "mass_pings"
                        },
                        {
                            name: "Malware or viruses",
                            value: "malware_viruses"
                        },
                        {
                            name: "Spamming",
                            value: "spam"
                        },
                        {
                            name: "ToS violation",
                            value: "tos_violation"
                        }
                    ]
				}
			],
		});
	}

	public async exec(ctx: Ctx) {
        const { user } = ctx.options.get("user", true);
        const { value: reason } = ctx.options.get("reason", true);

        console.log(user, reason);
	}
}

export default new StrikeCommand();
