import axios from "axios";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { MessageEmbed, Role, User, VoiceChannel } from "discord.js";
import { ChatCommand, Ctx } from "..";
import { accentColour, calculateDominantColour, l10n, settings } from "../../main";
import { replyWithError } from "../../util/error";
import { Permissions } from "../../util/permissions";

class AccessCommand extends ChatCommand {
    public constructor() {
        super("access", {
            description: "🔐 Change whether your space is open or closed to the public.",
            args: [
                {
                    name: "public",
                    description: "🔓️ Make your space public to everyone.",
                    type: ApplicationCommandOptionType.Subcommand
                },
                {
                    name: "private",
                    description: "🔒️ Make your space private and invite only.",
                    type: ApplicationCommandOptionType.Subcommand
                }
            ]
        });
    }

    public async exec(ctx: Ctx) {
        const subcommand = ctx.options.data[0].name;

        const member = await ctx.guild?.members.fetch(ctx.user.id);
        if (!member) return;

        const voiceID = await settings.get("bot.realms.vc_channel");
        const categoryId = await settings.get("bot.realms.category_channel");

        const vc = member.voice.channel;
        if (!vc) return replyWithError(ctx, "realms-not-in-channel").send();
        if (vc.id == voiceID) return replyWithError(ctx, "realms-joined-realm-channel-meta-incorrect-usage").send();
        if (vc?.parentId !== categoryId) return replyWithError(ctx, "realms-not-in-channel").send();
        if (!vc.permissionsFor(member).has("MOVE_MEMBERS")) return replyWithError(ctx, "realms-access-unchanged-permission").send();
    
        let membersKicked: string[] = [];

        switch (subcommand) {
            case "public":
                await vc.permissionOverwrites.edit(ctx.guild?.roles.everyone as Role, {
                    CONNECT: true
                });
                break;
            case "private":
                await vc.permissionOverwrites.edit(ctx.guild?.roles.everyone as Role, {
                    CONNECT: false
                });

                await vc.permissionOverwrites.edit(member, {
                    CONNECT: true
                });

                vc.members.forEach(async m => {
                    if (!vc.permissionsFor(m).has("CONNECT")) {
                        const disconnectedEmbed = new MessageEmbed()
                            .setColor(accentColour)
                            .setTitle("🔐 " + l10n.t(ctx, "realms-disconnected-no-permission", { name: vc.name }));

                        await m.voice.disconnect();
                        await m.send({ embeds: [disconnectedEmbed] });

                        membersKicked.push(m.user.tag);
                    }
                });

                break;
        }

        const embed = new MessageEmbed()
            .setColor(accentColour)
            .setTitle("🔐 " + l10n.t(ctx, "realms-changed-access", { state: subcommand == "public" ? "open" : "closed" }));

        const embeds = [embed];

        if (subcommand == "private") {
            if (membersKicked.length) {
                const listFormatter = new Intl.ListFormat(l10n.locale(ctx), { style: "long", type: "conjunction" });
    
                embeds.push(new MessageEmbed()
                    .setColor(accentColour)
                    .setTitle("⚠️ " + l10n.t(ctx, "realms-members-kicked-no-permission-on-access-change", { list: listFormatter.format(membersKicked) }))
                )
            } else {
                embeds.push(new MessageEmbed()
                    .setColor(accentColour)
                    .setTitle("⚠️ " + l10n.t(ctx, "realms-members-kicked-nobody"))
                )
            }
        }
        
        ctx.reply({
            embeds,
            ephemeral: true
        })
    }
}

export default new AccessCommand();