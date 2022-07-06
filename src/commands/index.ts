import { Base, BaseCommandInteraction } from "discord.js";
import { replyWithError } from "../util/error";

export type Ctx = BaseCommandInteraction;

class Command {
    public description: string = "No description";
    public owner: boolean = false;

    public constructor(public name: string, public options: Partial<Command>) {
        for (const [key, value] of Object.entries(options)) {
            (this as any)[key] = value;
        }
    }

    public async handler(ctx: Ctx) {
        if (this.owner && !ctx.memberPermissions?.has("MANAGE_GUILD")) {
            return replyWithError(ctx, "no-permission", { user: ctx.user.username });
        }

        return (this as any).exec(ctx);
    }
}

interface Command {
    name: string;
    description: string;
    owner: boolean;
    
    exec(ctx: Ctx): Promise<void>;
}


export default Command;