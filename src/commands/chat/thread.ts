import { ChatCommand, Ctx } from "..";
import renameThread, { setThreadTitle } from "../../actions/rename-thread";
import { accentColour } from "../../main";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import closeThread from "../../actions/close-thread";

class ThreadCommand extends ChatCommand {
    public constructor() {
        super("thread", {
            description: "Thread",
            args: [
                {
                    name: "rename",
                    description: "📝 Rename the thread",
                    type: 1
                },
                {
                    name: "close",
                    description: "✅ Mark the thread as solved",
                    type: 1
                }
            ]
        });
    }

    public async exec(ctx: Ctx) {
        const subcommand = ctx.options.data[0].name as string;
        if (!subcommand) return;

        switch (subcommand) {
            case "rename":
                renameThread.exec(ctx);

                break;
            case "close":
                closeThread.exec(ctx);

                break;
        }
    }
}

export default new ThreadCommand();