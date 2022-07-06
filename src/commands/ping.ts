import Command from ".";

class PingCommand extends Command {
    public constructor() {
        super("ping", {
            description: "Ping fuck off"
        });
    }
}

export default new PingCommand();