import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { Client, Intents, Interaction } from "discord.js";
import { config } from "dotenv"
import { readdirSync } from "fs";
import { glob } from "glob";
import { resolve } from "path";
import pino from "pino";
import Command from "./commands";

const log = pino({
    transport: {
        target: "pino-pretty"
    }
});

config();

const main = async () => {
    const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
    const rest = new REST({ version: "10" })
        .setToken(process.env.TOKEN as string);

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

    try {
        log.info("Started refreshing application (/) commands.");
        await rest.put(Routes.applicationCommands("993177336939810906"), { body: safeCmds });
        log.info("Successfully reloaded application (/) commands.");
    } catch (error) {
        log.error(error);
    }

    client.on("ready", () => {
        log.info(`Logged in as ${client.user?.tag}!`);
    });
      
      
    client.on("interactionCreate", async (interaction: Interaction) => {
        if (interaction.isCommand()) {
            const cmd = cmds.find(c => c.name == interaction.commandName);
            if (!cmd) return;

            await cmd.exec(interaction);
        }
    })
      
    client.login(process.env.TOKEN);
}

main();