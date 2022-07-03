import Akairo from "discord-akairo";

class PingCommand extends Akairo.Command {
    constructor() {
        super("ping", {
            aliases: ["ping"],
            category: "general",
            description: "Pong!",
            ratelimit: 3,
        });
    }
    exec(message: { reply: (arg0: string) => any }) {
        return message.reply("Pong!");
    }
}

export default PingCommand;
