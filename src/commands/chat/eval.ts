import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { ChatCommand, Ctx } from "..";
import { Permissions } from "../../util/permissions";
import vm from "vm";
import { inspect } from "util";
import { MessageAttachment } from "discord.js";
import * as main from "../../main";

class EvalCommand extends ChatCommand {
    public constructor() {
        super("eval", {
            description: "📄 Evaluate a statement - (Administrative)",
            permissions: [
                Permissions.ADMINISTRATOR
            ],
            args: [
                {
                    name: "code",
                    description: "Code",
                    type: ApplicationCommandOptionType.String,
                    required: true
                },
                {
                    name: "ephemeral",
                    description: "Is Ephemeral",
                    type: ApplicationCommandOptionType.Boolean
                }
            ]
        });
    }

    public async sanitise(text: any) {
        if (text && text.constructor.name == "Promise") text = await text;

        if (typeof text !== "string") text = inspect(text, { depth: 1 });

        text = text
            .replace(/`/g, "`" + String.fromCharCode(8203))
            .replace(/@/g, "@" + String.fromCharCode(8203));

        return text;
    }

    public async exec(ctx: Ctx) {
        const { value: code } = ctx.options.get("code", true);
        if (!code) return;

        let isEphemeral = true;

        const ephemeral = ctx.options.get("ephemeral") as any;
        if (ephemeral && "value" in ephemeral && ephemeral.value == false) isEphemeral = false; 

        const send = (data: any) => {
            ctx.channel?.send(data);
        }

        const bot = ctx.client;
        const settings = main.settings;

        try {
            const result = eval(code as string);
            const clean = await this.sanitise(result);

            if (clean.length >= 1980) {
                const attachment = new MessageAttachment(Buffer.from(clean), "eval.js");

                ctx.reply({
                    files: [attachment],
                    ephemeral: isEphemeral
                });
            } else {
                ctx.reply({
                    content: `\`\`\`js\n${clean}\`\`\``,
                    ephemeral: isEphemeral
                });
            }
        } catch (e) {
            ctx.reply({
                content: `**ERROR**:\n\`\`\`xl\n${e}\`\`\``,
                ephemeral: isEphemeral
            });
        }
    }
}

export default new EvalCommand();
