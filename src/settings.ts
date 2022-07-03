import Eva from "./eva";

class EvaSettings {
    public set(key: string, value: any) {
        if (typeof value == "object") {
            value = JSON.stringify(value);
        }

        this.bot.db("eva-settings").insert({ key, value })
    }

    public async get<K extends any>(key: string, defaultValue?: any): Promise<K> {
        const result = await this.bot.db("eva-settings").select().where({ key });

        return result.length == 0 
            ? defaultValue 
                ? defaultValue 
                : undefined 
            : result[0];
    }

    private async init() {
        const tableExists = await this.bot.db.schema.hasTable("eva-settings");

        if (!tableExists) {
            await this.bot.db.schema.createTable("eva-settings", (table) => {
                table.string("key").primary();
                table.string("value");
            });
        }
    }

    public constructor(public bot: Eva) {
        this.init();
    }
}

export default EvaSettings