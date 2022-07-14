import { ApplicationCommandOptionType, ChannelType } from "discord-api-types/v10";
import { CategoryChannel, Channel, Message, MessageEmbed, Permissions, TextChannel } from "discord.js";
import { ChatCommand, Ctx } from "..";
import { accentColour, l10n, setRealmChannel, settings } from "../../main";
import { replyWithError } from "../../util/error";
import * as P from "../../util/permissions";

export const sendSupportChannelOnboardEmbed = async (channel: TextChannel, oldMsg?: Message) => {
    const supportChannel = await settings.get(`bot.support_channels.${channel.id}`);

    const description = channel.topic && channel.topic.length 
        ? channel.topic 
        : `*Set a description by modifying the channel's topic*`;

    const embed = new MessageEmbed()
        .setTitle(`🤝 Get help with ${supportChannel.productName}`)
        .setDescription(`To create a new support thread, type your message into chat.\n\n${description}`)
        .setColor(accentColour)

    if (oldMsg) {
        try {
            oldMsg?.delete()
        } catch (e) {}
    }

    const msg = await channel.send({
        embeds: [embed]
    });

    await msg.pin();

    const msgs = (await channel.messages.fetch()).filter(m => m.type == "CHANNEL_PINNED_MESSAGE");

    await channel.bulkDelete(msgs);
}

class CreateSupportChannelCommand extends ChatCommand {
    public constructor() {
        super("create-support-channel", {
            description: "🤝 Create a support channel - (Administrative)",
            permissions: [
                P.Permissions.MANAGE_GUILD
            ],
            args: [
                {
                    name: "product_name",
                    description: "Product Name",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: "channel_name",
                    description: "Channel Name",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: "category",
                    description: "Channel Category",
                    type: ApplicationCommandOptionType.Channel,
                    channel_types: [ChannelType.GuildCategory],
                    required: true
                }
            ]
        });
    }

    public async exec(ctx: Ctx) {
        const productName = ctx.options.get("product_name", true).value as string;
        const channelName = ctx.options.get("channel_name", true).value as string;
        const category = ctx.options.get("category", true).channel as CategoryChannel;

        const channel = await category.createChannel(channelName, {
            permissionOverwrites: [
                {
                    id: ctx.guild?.id as any,
                    deny: [
                        Permissions.FLAGS.CREATE_PUBLIC_THREADS,
                        Permissions.FLAGS.CREATE_PRIVATE_THREADS
                    ]
                }
            ]
        });

        await settings.set(`bot.support_channels.${channel.id}`, {
            productName
        });

        await sendSupportChannelOnboardEmbed(channel);

        ctx.reply({
            content: "All done.",
            ephemeral: true
        })
    }
}

export default new CreateSupportChannelCommand();