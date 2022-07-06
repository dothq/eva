import { MessageEmbed } from "discord.js";
import Command, { Ctx } from ".";
import { accentColour } from "../main";

class AvatarCommand extends Command {
    public constructor() {
        super("avatar", {
            description: "🖼️ Set the bot's avatar - (Administrative)",
            owner: true
        });
    }

    public async exec(ctx: Ctx) {
        const embed = new MessageEmbed()
            .setColor(accentColour)
            .setDescription(`bing bong`)

        ctx.reply({
            embeds: [embed],
            ephemeral: true
        })
    }
}

export default new AvatarCommand();