import { ApplicationCommandOptionType, ChannelType } from "discord-api-types/v10";
import { MessageEmbed } from "discord.js";
import { ChatCommand, Ctx } from "..";
import { accentColour, l10n, setRealmChannel } from "../../main";
import { replyWithError } from "../../util/error";
import { Permissions } from "../../util/permissions";

class SetRealmChannelCommand extends ChatCommand {
    public constructor() {
        super("set-realm-channel", {
            description: "🔊 Set the realm channel - (Administrative)",
            permissions: [
                Permissions.MANAGE_GUILD
            ],
            args: [
                {
                    name: "channel",
                    description: "Realm Channel",
                    type: ApplicationCommandOptionType.Channel,
                    channel_types: [ChannelType.GuildVoice]
                },
                {
                    name: "category",
                    description: "Realm Category",
                    type: ApplicationCommandOptionType.Channel,
                    channel_types: [ChannelType.GuildCategory]
                }
            ]
        });
    }

    public async exec(ctx: Ctx) {
        const { channel } = ctx.options.get("channel", true);
        const { channel: category } = ctx.options.get("category", true);

        setRealmChannel(channel?.id as string, category?.id as string);

        const embed = new MessageEmbed()
            .setColor(accentColour)
            .setTitle("✅ " + l10n.t(ctx, "realms-set-channel"));

        ctx.reply({
            embeds: [embed],
            ephemeral: true
        })
    }
}

export default new SetRealmChannelCommand();