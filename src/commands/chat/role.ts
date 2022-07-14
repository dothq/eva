import { ChatCommand, Ctx } from "..";
import renameThread from "../../actions/rename-thread";
import closeThread from "../../actions/close-thread";
import { ApplicationCommandOptionType, APIApplicationCommandBasicOption } from "discord-api-types/v10";
import { hasPermission } from "../../util/permissions";
import { accentColour, l10n, settings } from "../../main";
import { replyWithError } from "../../util/error";
import { require2FA } from "../../util/2fa";
import { MessageEmbed, Role } from "discord.js";

const roleManagementOptions: APIApplicationCommandBasicOption[] = [
    {
        name: "user",
        description: "User",
        type: ApplicationCommandOptionType.User,
        required: true
    },
    {
        name: "role",
        description: "Role",
        type: ApplicationCommandOptionType.Role,
        required: true
    },
    {
        name: "reason",
        description: "Reason",
        type: ApplicationCommandOptionType.String,
        required: true
    }
];

class RoleCommand extends ChatCommand {
    public constructor() {
        super("role", {
            description: "Role",
            args: [
                {
                    name: "add",
                    description: "➕ Add a role to a user",
                    type: 1,
                    options: roleManagementOptions
                },
                {
                    name: "remove",
                    description: "➖ Remove a role from a user",
                    type: 1,
                    options: roleManagementOptions
                },
            ]
        });
    }

    public async exec(ctx: Ctx) {
        const subcommand = ctx.options.data[0].name as string;
        if (!subcommand) return;

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

        const { user } = ctx.options.get("user", true);
        const { role } = ctx.options.get("role", true);
        const { value: reason } = ctx.options.get("reason", true);

        if (!user || !role || !reason) return;

        const member = await ctx.guild?.members.fetch(ctx.member?.user.id as string);
        if (!member) return;

        const guildMember = await ctx.guild?.members.fetch(user.id);
        if (!guildMember) return;

        await require2FA(ctx);

        if (role?.position >= member.roles.highest.position) {
            return replyWithError(ctx, "cannot-add-role-higher-than-current").send();
        }

        switch (subcommand) {
            case "add":
                if (guildMember.roles.cache.has(role.id)) {
                    return replyWithError(ctx, `user-already-has-role`).send()
                }

                await guildMember.roles.add(role as Role, reason as any);

                const addedEmbed = new MessageEmbed()
                    .setColor(accentColour)
                    .setTitle(`✅ ` + l10n.t(ctx, `added-role-to-user`, { 
                        rolename: role.name, 
                        user: guildMember.user.tag 
                    }));

                ctx.reply({
                    embeds: [addedEmbed],
                    ephemeral: true
                });

                break;
            case "remove":
                if (!guildMember.roles.cache.has(role.id)) {
                    return replyWithError(ctx, `user-does-not-have-role`).send()
                }

                await guildMember.roles.remove(role as Role, reason as any);    

                const removedEmbed = new MessageEmbed()
                    .setColor(accentColour)
                    .setTitle(`✅ ` + l10n.t(ctx, `removed-role-from-user`, { 
                        rolename: role.name, 
                        user: guildMember.user.tag 
                    }));

                ctx.reply({
                    embeds: [removedEmbed],
                    ephemeral: true
                });

                break;
        }
    }
}

export default new RoleCommand();