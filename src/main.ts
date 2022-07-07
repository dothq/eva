import { REST } from "@discordjs/rest";
import axios from "axios";
import { Routes } from "discord-api-types/v10";
import { Client, Intents, Interaction, Permissions } from "discord.js";
import { config } from "dotenv"
import { readdirSync } from "fs";
import { glob } from "glob";
import Vibrant from "node-vibrant";
import { resolve } from "path";
import pino from "pino";
import Command from "./commands";
import L10n from "./l10n";
import { replyWithError } from "./util/error";

export let accentColour: any = "#ffffff";

export const log = pino({
    transport: {
        target: "pino-pretty"
    }
});

export const l10n = new L10n();

export const calculateDominantColour = async (client: Client) => {
    const avatarURL = client.user?.avatarURL({ format: "png" }) as string;
    const { data: avatar } = await axios.get(avatarURL, { responseType: "arraybuffer" });
    const palette = await Vibrant.from(avatar).getPalette();

    return accentColour = palette.Vibrant?.hex as string;
}

config();

const main = async () => {
    const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
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

        log.info("Started registering application commands...");

        const commands = readdirSync(resolve(__dirname, "commands")).filter(c => c !== "index.ts");
        const cmds: Command[] = [];
        const safeCmds: Command[] = [];

        for await (const cmd of commands) {
            let { default: mod } = await import(resolve(__dirname, "commands", cmd));

            delete mod.$commandInit;
            mod.options = mod.args;
            delete mod.args;

            cmds.push(mod);
            safeCmds.push(mod);

            log.info(`Registered /${mod.name} command.`);
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
            log.info(`Successfully registered ${safeCmds.length} application commands.`);
        } catch (error) {
            log.error(error);
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
            if (interaction.isCommand()) {
                const cmd = cmds.find(c => c.name == interaction.commandName);

                try {
                    await cmd?.handler(interaction);
                } catch(e: any) {
                    log.error(e.stack);

                    try {
                        const err = replyWithError(
                            interaction, 
                            "internal-bot",
                            { cmd: interaction.commandName }
                        );

                        err.embed.setDescription(e.message);

                        err.send();
                    } catch(e: any) {
                        log.error(e.stack);

                        try {
                            interaction.reply({
                                content: "Catastrophic error occurred!"
                            });
                        } catch(e: any) {
                            log.error(e.stack);
                        }
                    }
                }
            }
        })

        log.info(`Logged in as ${client.user?.tag}!`);
    });
      
    client.login(process.env.TOKEN);
}

main();