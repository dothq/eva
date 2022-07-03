import Akairo from "discord-akairo";
import { AkairoClient, CommandHandler } from "discord-akairo";
import Database from "better-sqlite3";
const db = new Database("storage.db");

class Eva extends AkairoClient {
    commandHandler: Akairo.CommandHandler;
    constructor() {
        super({
            intents: ["GUILDS"],
        });
        this.commandHandler = new CommandHandler(this, {
            directory: "./commands/",
            prefix: "-",
        });
        this.commandHandler.loadAll();
    }
}
new Akairo.SQLiteProvider(db, "storage");

export default Eva;
