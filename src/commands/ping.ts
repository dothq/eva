import { SlashCommand } from "slashasaurus";

export default new SlashCommand(
    {
        name: "ping",
        description: "Pings the bot to make sure everything is working",
        options: [],
    },
    {
        run: (interaction) => {
            interaction.reply({
                content: `Pong!`,
                ephemeral: true,
            });
        },
    }
);