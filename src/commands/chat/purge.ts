import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { MessageEmbed, Role, User } from "discord.js";
import type { TextChannel } from "discord.js";
import { ChatCommand, Ctx } from "..";
import { accentColour, l10n, settings } from "../../main";
import { hasPermission, Permissions } from "../../util/permissions";
import { replyWithError } from "../../util/error";
import { require2FA } from "../../util/2fa";

const lzma = require("lzma");

class PurgeCommand extends ChatCommand {
	public constructor() {
		super("purge", {
			description: "🔥 Purge messages - (Administrative)",
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

        await require2FA(ctx);

		const messageAmount = parseInt(
			ctx.options.get("number_of_messages")!.value as string
		) as number;

		const { channel } = (ctx.options.get("in_channel") || ctx) as { channel: TextChannel };

        const msgs = await channel.messages.fetch();
        
        const filteredMsgs = msgs.filter((msg) => {
            let fromUser = true;
            let fromRole = true;
            
            if (ctx.options.get("from_user")) {
                const user = ctx.options.get("from_user")!.user as User;

                fromUser = msg.author.id == user.id;
            }

            if (ctx.options.get("from_role")) {
                const role = ctx.options.get("from_role")!.role as Role;

                fromRole = !!msg.member?.roles.cache.some(r => r.id === role.id);
            }

            return fromUser || fromRole;
        }).first(messageAmount);

		await channel.bulkDelete(filteredMsgs);

        let lines = [
            "/*", 
            `   Deleted messages summary`, 
            ``,
            `   Total: ${filteredMsgs.length}`, 
            `   In: #${channel.name} (${channel.id})`
        ];

        if (ctx.options.get("from_user")) {
            const user = ctx.options.get("from_user")!.user as User;

            lines.push(`   From user: ${user.tag} (${user.id})`)
        }

        if (ctx.options.get("from_role")) {
            const role = ctx.options.get("from_role")!.role as Role;

            lines.push(`   From role: @${role.name} (${role.id})`)
        }

        const d = new Date()

        lines = lines.concat([
            `   By: ${ctx.user.tag} (${ctx.user.id}) at ${d.toDateString()} ${d.toTimeString().split(" (")[0].trim()}`, 
            "*/", 
            ""
        ])

        for (const msg of filteredMsgs) {
            lines.push(`${msg.createdAt.toDateString()} ${msg.createdAt.toTimeString().split(" (")[0].trim()} - ${msg.author.tag}${msg.member?.nickname ? ` [${msg.member?.nickname}]` : ``} (${msg.author.id}) {${msg.id}}: ${msg.content}`)
        }

        const compressed = lzma.compress(lines.join("\n"), 1);
        const b64 = Buffer.from(compressed).toString("base64");

        const embed = new MessageEmbed()
            .setColor(accentColour)
            .setTitle("✅ " + l10n.t(ctx, "purged-chat-messages", { count: filteredMsgs.length }))
            .setDescription(`[${l10n.t(ctx, "purged-msgs-log")}](https://paste.dothq.org/#${b64})`)

		ctx.reply({
            embeds: [embed],
            ephemeral: true
		});
	}
}

export default new PurgeCommand();
