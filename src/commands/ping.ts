import type { BaseCommandInteraction, CacheType } from "discord.js";
import Command, { Ctx } from ".";

class PingCommand extends Command {
    public constructor() {
        super("ping", {
            description: "Ping fuck off"
        });
    }

    public async exec(ctx: Ctx) {
        ctx.reply({
            content: ctx.commandName,
            ephemeral: true
        })
    }
}

export default new PingCommand();