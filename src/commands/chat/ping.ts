import { MessageEmbed } from "discord.js";
import { ChatCommand, Ctx } from "..";
import { accentColour } from "../../main";

class PingCommand extends ChatCommand {
    public constructor() {
        super("ping", {
            description: "š Check the bot's response time"
        });
    }

    public async exec(ctx: Ctx) {
        const embed = new MessageEmbed()
            .setColor(accentColour)
            .setDescription(`š ${Date.now() - ctx.createdTimestamp}ms\nš ${Math.round(ctx.client.ws.ping)}ms`)

        ctx.reply({
            embeds: [embed],
            ephemeral: true
        })
    }
}

export default new PingCommand();