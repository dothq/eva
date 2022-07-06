import { Base, BaseCommandInteraction } from "discord.js";

export type Ctx = BaseCommandInteraction;

class Command {
    public description: string = "No description"

    public constructor(public name: string, public options: Partial<Command>) {
        for (const [key, value] of Object.entries(options)) {
            (this as any)[key] = value;
        }
    }
}

interface Command {
    name: string;
    description: string;
    
    exec(ctx: Ctx): Promise<void>;
}


export default Command;