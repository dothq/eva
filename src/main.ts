import { REST } from "@discordjs/rest";
import axios from "axios";
import { Routes } from "discord-api-types/v10";
import { Client, Intents, Interaction } from "discord.js";
import { config } from "dotenv"
import { readdirSync } from "fs";
import { glob } from "glob";
import Vibrant from "node-vibrant";
import { resolve } from "path";
import pino from "pino";
import Command from "./commands";
import L10n from "./l10n";

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

        const commands = readdirSync(resolve(__dirname, "commands")).filter(c => c !== "index.ts");
        const cmds: Command[] = [];
        const safeCmds: Command[] = [];

        for await (const cmd of commands) {
            let { default: mod } = await import(resolve(__dirname, "commands", cmd));

            delete mod.options;

            cmds.push(mod);

            for (const [key] of Object.entries(mod)) {
                if (typeof mod[key] == "function") {
                    delete mod[key];
                }
            }

            safeCmds.push(mod);
        }

        log.info(`Logged in as ${client.user?.tag}!`);

        try {
            log.info("Started refreshing application (/) commands.");
            await rest.put(Routes.applicationCommands("993177336939810906"), { body: safeCmds });
            log.info("Successfully reloaded application (/) commands.");
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
                if (!cmd) return;
    
                await cmd.handler(interaction);
            }
        })
    });
      
    client.login(process.env.TOKEN);
}

main();