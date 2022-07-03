import Akairo from "discord-akairo";
import Database from "better-sqlite3";
const db = new Database("storage.db");

class Eva extends Akairo.AkairoClient {
    constructor() {
        super({
            intents: ["GUILDS"],
        });
    }
}
new Akairo.SQLiteProvider(db, "storage");

export default Eva;
