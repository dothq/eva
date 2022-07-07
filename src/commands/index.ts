import { APIApplicationCommandOption, APIMessage } from "discord-api-types/v10";
import { BaseCommandInteraction, InteractionReplyOptions, Message, PermissionFlags, Permissions } from "discord.js";
import { l10n, log } from "../main";
import { replyWithError } from "../util/error";
import { swapKVObject } from "../util/obj";

export type Ctx = BaseCommandInteraction;

class Command {
    /* 
        Any new fields added that aren't apart of the Discord API 
        should be deleted in the command import process in main.ts.

        Structure: https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-structure
    */
    public description: string = "No description";
    public permissions: string[] = [];
    public args: APIApplicationCommandOption[] = [];

    public constructor(public name: string, public $commandInit: Partial<Command>) {
        for (const [key, value] of Object.entries($commandInit)) {
            (this as any)[key] = value;
        }
    }

    public async handler(ctx: Ctx) {
        if (this.permissions && this.permissions.length) {
            let hasPermission = false;

            for (const permission of this.permissions) {
                const bitflag = (Permissions.FLAGS as any)[permission];

                if (ctx.memberPermissions?.has(bitflag)) {
                    hasPermission = true;
                    break;
                }
            }

            if (!hasPermission) {
                const isSingle = this.permissions.length == 1;

                const toKebabCase = (t: string) => {
                    return t.replace(/_/g, "-").toLowerCase();
                }

                const locale = l10n.locale(ctx);

                const listFormatter = new Intl.ListFormat(locale, { style: "long", type: "disjunction" });
                const permission = isSingle 
                    ? l10n.t(ctx, `permission-${toKebabCase(this.permissions[0])}`)
                    : listFormatter.format(this.permissions.map(p => l10n.t(ctx, `permission-${toKebabCase(p)}`)))

                return replyWithError(ctx, `no-permission-${isSingle ? "single" : "multiple"}`, { 
                    permission
                }).send();
            }
        }

        return (this as any).exec(ctx);
    }
}

interface Command {
    name: string;
    description: string;
    permissions: string[];
    args: APIApplicationCommandOption[];
    
    exec(ctx: Ctx): Promise<void>;
}


export default Command;