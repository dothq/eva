import { MessageEmbed } from "discord.js";
import Command, { Ctx } from ".";
import { accentColour } from "../main";

class PingCommand extends Command {
    public constructor() {
        super("ping", {
            description: "🏓 Check the bot's response time"
        });
    }

    public async exec(ctx: Ctx) {
        const embed = new MessageEmbed()
            .setColor(accentColour)
            .setDescription(`🏓 ${Date.now() - ctx.createdTimestamp}ms\n💗 ${Math.round(ctx.client.ws.ping)}ms`)

        ctx.reply({
            embeds: [embed],
            ephemeral: true
        })
    }
}

export default new PingCommand();