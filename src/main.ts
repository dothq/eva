import { REST } from "@discordjs/rest";
import axios from "axios";
import { Routes } from "discord-api-types/v10";
import { CategoryChannel, CategoryChannelResolvable, Client, Intents, Interaction, MessageActionRow, MessageButton, MessageEmbed, Permissions } from "discord.js";
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

export let accentColour: any = "#ffffff";

export let realmVoiceChannelId: string = "";
export let realmCategoryId: string = "";

export const log = pino({
    transport: {
        target: "pino-pretty"
    }
});

export const DEFAULT_AVATAR = "https://cdn.discordapp.com/embed/avatars/0.png";

export const l10n = new L10n();

export const calculateDominantColour = async (client: Client) => {
    const avatarURL = client.user?.avatarURL({ format: "png" }) as string || DEFAULT_AVATAR;
    const { data: avatar } = await axios.get(avatarURL, { responseType: "arraybuffer" });
    const palette = await Vibrant.from(avatar).getPalette();

    return accentColour = palette.Vibrant?.hex as string;
}

export const setRealmChannel = (chid: string, ctid: string) => {
    realmVoiceChannelId = chid;
    realmCategoryId = ctid;
}

const checkRealmCategoryForEmptyChannels = async (client: Client) => {
    if (!realmCategoryId.length) return; 

    try {
        const category = await client.channels.fetch(realmCategoryId) as CategoryChannel;

        category.children.forEach(async c => {
            if (c.type == "GUILD_VOICE" && !c.members.size && c.deletable) {
                try {
                    await c.delete();
                } catch (e) {}
            }
        })
    } catch(e) {}
}

config();

const main = async () => {
    const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES] });
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

        const commandFiles = glob.sync(resolve(__dirname, "commands", "**/*.ts").replace(/\\/g, '/')).filter(c => !c.endsWith("index.ts"));
        const actionFiles = glob.sync(resolve(__dirname, "actions", "**/*.ts").replace(/\\/g, '/')).filter(c => !c.endsWith("index.ts"));

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
                } else if (interaction.isButton()) {
                    const act = actions.find(c => c.name == interaction.customId);

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

            if (state.channelId == realmVoiceChannelId) {
                const category = await state.guild.channels.fetch(realmCategoryId) as CategoryChannelResolvable;

                const vc = await state.guild.channels.create(`${state.member?.user.username}'s space`, { 
                    parent: category,
                    type: "GUILD_VOICE",
                    permissionOverwrites: [
                        {
                            id: state.guild.id,
                            deny: [Permissions.FLAGS.CONNECT],
                        },
                        {
                            id: state.member?.id as any,
                            allow: [Permissions.FLAGS.CONNECT],
                        }
                    ]
                });

                await state.member?.voice.setChannel(vc, "Created personal realm");

                const embed = new MessageEmbed()
                    .setColor(accentColour)
                    .setTitle(`👥 Invite members using the /add command.`)

                vc.send({
                    content: `<@${state.member?.id}>`,
                    embeds: [embed]
                });
            } else if (!state.channelId && oldstate.channel?.parentId == realmCategoryId) {
                try {
                    await oldstate.channel.delete();
                } catch(e) {}
            }
        });

        setInterval(async () => {
            await checkRealmCategoryForEmptyChannels(client);
        }, 10000);

        log.info(`Logged in as ${client.user?.tag}!`);
    });
      
    client.login(process.env.TOKEN);
}

main();