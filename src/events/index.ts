import { ClientEvents } from "discord.js";

export class DiscordEvent {
    public constructor(
        public event: keyof ClientEvents, 
        public options?: {
            once?: boolean
        }
    ) {

    }
}