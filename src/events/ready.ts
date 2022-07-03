import { resolve } from "path";
import { DiscordEvent } from ".";
import Eva from "../eva";

class ReadyEvent extends DiscordEvent {
    public constructor() {
        super("ready", { once: true })
    }

    public async fired(bot: Eva) {
        bot.logger.info(`Logged in to ${bot.user.tag}`);

        bot.logger.info(`Guilds:`)

        for (const [id, guild] of (await bot.guilds.fetch()).entries()) {
            bot.logger.info(`  - ${guild.name} (${id})`)
        }

        await bot.registerCommandsFrom(
            resolve(process.cwd(), "src", "commands"),
            true as any
        );
    }
}

export default ReadyEvent;