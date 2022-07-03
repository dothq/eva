import Akairo from "discord-akairo";
import type { Message } from "discord.js";

class PingCommand extends Akairo.Command {
    constructor() {
        super("ping", {
            aliases: ["ping"],
            category: "general",
            description: "Pong!",
            ratelimit: 3,
        });
    }
    exec(message: Message) {
        return message.reply("Pong!");
    }
}

export default PingCommand;
