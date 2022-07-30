import { ChatCommand, Ctx } from "..";
import { ApplicationCommandOptionType, APIApplicationCommandBasicOption } from "discord-api-types/v10";
import { require2FA } from "../../util/2fa";
import { replyWithError } from "../../util/error";
import { hasPermission } from "../../util/permissions";
import { accentColour, l10n, settings } from "../../main";
import { MessageEmbed } from "discord.js";

const ruleManagementOptions: APIApplicationCommandBasicOption[] = [
    {
        name: "id",
        description: "ID",
        type: ApplicationCommandOptionType.String,
        required: true
    },
    {
        name: "name",
        description: "Name",
        type: ApplicationCommandOptionType.String,
        required: true
    },
    {
        name: "description",
        description: "Description",
        type: ApplicationCommandOptionType.String,
        required: true
    }
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
                    options: ruleManagementOptions
                },
                {
                    name: "remove",
                    description: "➖ Remove a rule",
                    type: 1,
                    options: [ruleManagementOptions[0]]
                },
                {
                    name: "edit",
                    description: "✏️ Edit a rule",
                    type: 1,
                    options: [ruleManagementOptions[0]]
                },
                {
                    name: "list",
                    description: "📄 View all rules",
                    type: 1
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

        const { value: id } = ctx.options.get("id", true);
        const { value: name } = ctx.options.get("name", true);
        const { value: description } = ctx.options.get("description", true);

        await require2FA(ctx, async (ctx) => {
            console.log("hi")

            switch (subcommand) {
                case "add":    
                    await settings.push("bot.moderation.rules", {
                        id,
                        name,
                        description
                    });
    
                    const addedEmbed = new MessageEmbed()
                        .setColor(accentColour)
                        .setTitle(`✅ ` + l10n.t(ctx, `rules-added`, { 
                            id
                        }));
    
                    await ctx.reply({
                        embeds: [addedEmbed],
                        ephemeral: true
                    });
    
                    break;
                case "remove":
                    const index = await settings.findIndex("bot.moderation.rules", (r: any) => r.id == id);
                    await settings.pop("bot.moderation.rules", index);
    
                    const removedEmbed = new MessageEmbed()
                        .setColor(accentColour)
                        .setTitle(`✅ ` + l10n.t(ctx, `rules-removed`, { 
                            id
                        }));
    
                    await ctx.reply({
                        embeds: [removedEmbed],
                        ephemeral: true
                    });
    
                    break;
            }
        });
    }
}

export default new RuleCommand();