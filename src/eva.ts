import { Intents } from "discord.js";
import pino from "pino";
import { SlashasaurusClient } from "slashasaurus";
import glob from "glob";
import { resolve } from "path";
import { platform } from "os";
import knex, { Knex } from "knex";
import EvaSettings from "./settings";
import axios from "axios";
import { createHash } from "crypto";

class Eva extends SlashasaurusClient {
    public db!: Knex;

    public settings!: EvaSettings;

    public logger = pino({
        transport: {
            target: "pino-pretty",
            options: {
                colorize: true
            }
        }
    });

    private async bindEvents() {
        const events = glob.sync(resolve(__dirname, "events", "**", "*.ts"))

        for await (const e of events) {
            const module = await import(e);

            if ("default" in module) {
                const child = new module.default();

                this[child.options && child.options.once ? "once" : "on"](child.event, child.fired);
            }
        }
    }

    private async setupDatabase() {
        this.db = knex({
            client: "better-sqlite3",
            useNullAsDefault: true,
            connection: {
                filename: "storage.db"
            }
        });

        try {
            await this.db.raw("PRAGMA integrity_check");
        } catch(e) {
            this.logger.error(`Database integrity check failed. Perhaps it is corrupt?`);
            process.exit(1);
        }

        this.logger.info(`Loaded bot database`);
    }

    private async setIdentity() {
        const lastAvatarUpdate = await this.settings.get<number>("last-avatar-update", 0);

        if (lastAvatarUpdate >= Date.now()+5400000) {
            return
        }

        this.settings.set("last-avatar-update", +Date.now());

        let defaultGuild = await this.settings.get<string>("default-guild");

        if (!defaultGuild) {
            const guilds = await this.guilds.fetch();
            if (guilds.size == 0) return;

            defaultGuild = guilds.first()?.id as string;

            this.settings.set("default-guild", defaultGuild);
        }

        const guild = await this.guilds.fetch(defaultGuild);

        if (!guild) return this.logger.error("Failed to fetch guild for identity.");

        const icon = guild.iconURL() || "https://cdn.discordapp.com/embed/avatars/0.png";
        const name = guild.name || "Eva";

        try {
            this.user.setAvatar(icon);
            this.user.setUsername(name);
            this.user.setPresence({
                status: "online",
                activities: [
                    {
                        name,
                        type: "WATCHING"
                    }
                ]
            });
        } catch(e) {}
   }

    public async init() {
        await this.setupDatabase();
        await this.bindEvents();

        this.settings = new EvaSettings(this);

        this.once("ready", async () => {
            this.user.setPresence({
                status: "dnd",
                activities: [
                    {
                        name: "things load...",
                        type: "WATCHING"
                    }
                ]
            });

            await this.setIdentity();
            setInterval(() => this.setIdentity(), 10000);
        })
    }

    public constructor() {
        super(
            {
                intents: [Intents.FLAGS.GUILDS],
                restRequestTimeout: 30 * 1000
            },
            {}
        )

        if (platform() !== "linux") {
            this.logger.error("Eva is only designed to run on GNU/Linux.");
            return;
        }

        this.init();
    }
}

export default Eva;