import { REST } from "@discordjs/rest";
import axios from "axios";
import { Routes } from "discord-api-types/v10";
import { CategoryChannel, CategoryChannelResolvable, Client, GuildManager, GuildMember, Intents, Interaction, MessageActionRow, MessageButton, MessageEmbed, Permissions, TextChannel, TextChannelResolvable, VoiceChannel } from "discord.js";
import { config } from "dotenv"
import { readdirSync } from "fs";
import { glob } from "glob";
import Vibrant from "node-vibrant";
import { basename, resolve } from "path";
import pino from "pino";
import { exit } from "process";
import { Action } from "./actions";
import { Command, Ctx } from "./commands";
import L10n from "./l10n";
import { replyWithError } from "./util/error";
import fs from 'fs-extra';
import Keyv from "keyv";
import e, { Express } from "express";
import { sendSupportChannelOnboardEmbed } from "./commands/chat/create-support-channel";

export let accentColour: any = "#ffffff";

export const log = pino({
    transport: {
        target: "pino-pretty"
    }
});

export const DEFAULT_AVATAR = "https://cdn.discordapp.com/embed/avatars/0.png";

let keyv = new Keyv('sqlite://./settings.db', {
    table: "settings",
    busyTimeout: 10000
});

export const settings = keyv as {
    push: (key: string, value: any) => Promise<true>,
    pop: (key: string, index: number) => Promise<true>,
    findIndex: (key: string, predicate: any) => Promise<number>
} & typeof keyv;

settings.push = async (key: string, value: any) => {
    const v = await settings.get(key);

    if (Array.isArray(v)) {
        await settings.set(key, [...v, value]);

        return true;
    } else if (v == undefined) {
        await settings.set(key, [value]);

        return true;
    } else {
        return undefined as any;
    }
};

settings.pop = async (key: string, index: number) => {
    const v = await settings.get(key);

    if (Array.isArray(v)) {
        await settings.set(key, v.filter((_, i) => i !== index));

        return true;
    } else {
        return undefined as any;
    }
};

settings.findIndex = async (key: string, predicate: (value: any, index: number, obj: any[]) => unknown) => {
    const v = await settings.get(key);

    if (Array.isArray(v)) {
        return v.findIndex(predicate)
    } else {
        return undefined as any;
    }
};

export const l10n = new L10n();

export const calculateDominantColour = async (client: Client) => {
    const avatarURL = client.user?.avatarURL({ format: "png" }) as string || DEFAULT_AVATAR;
    const { data: avatar } = await axios.get(avatarURL, { responseType: "arraybuffer" });
    const palette = await Vibrant.from(avatar).getPalette();

    return accentColour = palette.Vibrant?.hex as string;
}

export const setRealmChannel = (channelid: string, categoryid: string) => {
    settings.set("bot.realms.vc_channel", channelid);
    settings.set("bot.realms.category_channel", categoryid);
}

const checkRealmCategoryForEmptyChannels = async (client: Client) => {
    if (!(await settings.get("bot.realms.vc_channel"))) return; 

    const vcId = await settings.get("bot.realms.vc_channel");

    try {
        const categoryid = await settings.get("bot.realms.category_channel");

        const category = await client.channels.fetch(categoryid) as CategoryChannel;

        category.children.forEach(async c => {
            if (c.type == "GUILD_VOICE" && !c.members.size && c.deletable && c.id !== vcId) {
                try {
                    await c.delete();
                } catch (e) {}
            }
        })
    } catch(e) {}
}

export const threadCreateEmbed = () => {
    return new MessageEmbed()
        .setTitle(`✅ Support thread created`)
        .setDescription(`A thread has been created from your message.\n\nIf the thread name looks incorrect, you can rename it by typing \`/thread rename\`.\n\nOnce you're happy that your issue has been solved, type \`/thread close\` to close the thread.`)
        .setColor(accentColour)
}

config();

export let server: Express;

const main = async () => {
    const client = new Client({ intents: [
        Intents.FLAGS.GUILDS, 
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_MESSAGES
    ] });
    const rest = new REST({ version: "10" })
        .setToken(process.env.TOKEN as string);

    client.on("ready", async () => {
        client.user?.setPresence({
            status: "dnd",
            activities: [
                {
                    type: "WATCHING",
                    name: "things load..."
                }
            ]
        });

        await calculateDominantColour(client);

        log.info("Started registering application interactions...");

        const commandFiles = glob.sync(resolve(__dirname, "commands", "**", "*.ts")).filter(c => !c.endsWith("index.ts"));
        const actionFiles = glob.sync(resolve(__dirname, "actions", "**", "*.ts")).filter(c => !c.endsWith("index.ts"));

        const cmds: Command[] = [];
        const safeCmds: Command[] = [];
        const actions: Action[] = [];

        for await (const cmd of commandFiles) {
            let { default: mod } = await import(cmd);

            delete mod.$commandInit;
            mod.options = mod.args;
            delete mod.args;

            cmds.push(mod);
            safeCmds.push(mod);

            const cmdTypeBinding: any = {
                1: "chat",
                2: "user",
                3: "message"
            }

            log.info(`Registering /${basename(cmd).split(".")[0]} ${cmdTypeBinding[mod.type]} command...`);
        }

        for await (const act of actionFiles) {
            let { default: mod } = await import(act);

            delete mod.$actionInit;

            actions.push(mod);

            log.info(`Registering ${basename(act).split(".")[0]} action...`);
        }

        try {
            for (const cmd of safeCmds as any) {
                for (const [key] of Object.entries(cmd)) {
                    if (typeof cmd[key] == "function") {
                        delete cmd[key];
                    }
                }
    
                // Remove any properties that are incompatible with Discord API.
            }

            await rest.put(Routes.applicationCommands("993177336939810906"), { body: safeCmds });
            log.info(`Successfully registered ${safeCmds.length + actions.length} application interactions.`);
        } catch (error: any) {
            log.error(error.stack);
            return;
        }

        client.user?.setPresence({
            status: "online",
            activities: [
                {
                    type: "WATCHING",
                    name: "Dot Community"
                }
            ]
        });

        client.on("interactionCreate", async (interaction: Interaction) => {
            try {
                if (interaction.isCommand() ||  interaction.isMessageContextMenu()) {
                    const cmd = cmds.find(c => c.name == interaction.commandName);

                    await cmd?.handler(interaction as Ctx);
                } else if (interaction.isButton() || interaction.isModalSubmit() || interaction.isSelectMenu()) {
                    const act = actions.find(c => interaction.customId.startsWith(c.name));

                    await act?.exec(interaction as any);
                }
            } catch(e: any) {
                log.error(e.stack);

                try {
                    const err = replyWithError(
                        interaction as Ctx, 
                        "internal-bot",
                        { cmd: (interaction as any).commandName || (interaction as any).customId || "UNKNOWN" }
                    );

                    err.embed.setDescription(e.message);

                    err.send();
                } catch(e: any) {
                    log.error(e.stack);

                    try {
                        (interaction as any).reply({
                            content: "Catastrophic error occurred!"
                        });
                    } catch(e: any) {
                        log.error(e.stack);
                    }
                }
            }
        });

        client.on("voiceStateUpdate", async (oldstate, state) => {
            await checkRealmCategoryForEmptyChannels(client);

            const vcId = await settings.get("bot.realms.vc_channel");
            const categoryId = await settings.get("bot.realms.category_channel");

            const creationPermissionOverride = (ownerId: any) => [
                {
                    id: state.guild.id,
                    deny: [Permissions.FLAGS.CONNECT],
                },
                {
                    id: ownerId,
                    allow: [
                        Permissions.FLAGS.CONNECT,
                        Permissions.FLAGS.SEND_MESSAGES,
                        Permissions.FLAGS.MOVE_MEMBERS,
                        Permissions.FLAGS.MUTE_MEMBERS,
                        Permissions.FLAGS.DEAFEN_MEMBERS
                    ],
                }
            ];

            if (state.channelId == vcId) {
                const category = await state.guild.channels.fetch(categoryId) as CategoryChannelResolvable;

                const vc = await state.guild.channels.create(`${state.member?.user.username}'s space`, { 
                    parent: category,
                    type: "GUILD_VOICE",
                    permissionOverwrites: creationPermissionOverride(state.member?.id)
                });

                await state.member?.voice.setChannel(vc, "Created personal realm");

                const membersEmbed = new MessageEmbed()
                    .setColor(accentColour)
                    .setTitle(`👥 Manage members using the /add and /remove command.`);

                const accessEmbed = new MessageEmbed()
                    .setColor(accentColour)
                    .setTitle(`🔐 Change who can access your space using /access public/private.`);

                vc.send({
                    content: `<@${state.member?.id}>`,
                    embeds: [membersEmbed, accessEmbed]
                });
            } else if (!state.channelId && oldstate.channel?.parentId == categoryId) {
                if (oldstate.channel?.members.size) {
                    const members = oldstate.channel?.members;

                    if (oldstate.channel.members.size == 1) {
                        const newOwner = members.first() as GuildMember;

                        await oldstate.channel.setName(`${newOwner.user.username}'s space`);
                        await oldstate.channel.permissionOverwrites.set(creationPermissionOverride(newOwner.id));
                    }
                } else {
                    try {
                        await oldstate.channel?.delete();
                        
                    } catch(e) {}
                }
            }
        });

        client.on("messageCreate", async (msg) => {
            const isSupportChannel = await settings.get(`bot.support_channels.${msg.channelId}`)

            if (msg && isSupportChannel) {
                if (!msg.content || !msg.content.length) {
                    return;
                }

                if (msg.author.id == msg.client.user?.id) {
                    return;
                }

                const channel = msg.channel as TextChannel;

                const thread = await channel.threads.create({
                    name: `❓️ ・ ${msg.cleanContent}`,
                    startMessage: msg,
                    autoArchiveDuration: "MAX"
                });

                const oldChannelPins = await channel.messages.fetchPinned();
                const oldMsg = oldChannelPins.first() || undefined;

                const row = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setCustomId("rename-thread")
                            .setLabel("Rename Thread")
                            .setEmoji("✏️")
                            .setStyle("SECONDARY"),
                        new MessageButton()
                            .setCustomId("close-thread")
                            .setLabel("Mark as solved")
                            .setEmoji("✅")
                            .setStyle("SECONDARY")
                    )

                await thread.send({
                    embeds: [threadCreateEmbed()],
                    components: [row]
                });

                setTimeout(async () => {
                    await sendSupportChannelOnboardEmbed(channel, oldMsg);
                }, 3000);
            }
        });

        client.on("channelUpdate", async (oldchannel, newchannel) => {
            const isSupportChannel = await settings.get(`bot.support_channels.${oldchannel.id}`);

            if (isSupportChannel) {
                const oldChannelPins = await (oldchannel as TextChannel).messages.fetchPinned();
                const oldMsg = oldChannelPins.first() || undefined;

                await sendSupportChannelOnboardEmbed(newchannel as TextChannel, oldMsg);
            }
        })

        setInterval(async () => {
            await checkRealmCategoryForEmptyChannels(client);
        }, 10000);

        log.info(`Logged in as ${client.user?.tag}!`);
    });
      
    client.login(process.env.TOKEN);
}

process.on("uncaughtException", (e) => {
    log.error(e);
})

process.on("unhandledRejection", (e) => {
    log.error(e);
})

main();