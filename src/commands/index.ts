import { APIApplicationCommandOption, APIMessage } from "discord-api-types/v10";
import { BaseCommandInteraction, ContextMenuInteraction, Interaction, InteractionReplyOptions, Message, MessageContextMenuInteraction, PermissionFlags, Permissions } from "discord.js";
import { l10n, log } from "../main";
import { replyWithError } from "../util/error";

export type Ctx = BaseCommandInteraction & MessageContextMenuInteraction & ContextMenuInteraction;

enum CommandType {
    Chat = 1,
    User = 2,
    Message = 3
}

class Command {
    /* 
        Any new fields added that aren't apart of the Discord API 
        should be deleted in the command import process in main.ts.

        Structure: https://discord.com/developers/docs/interactions/application-commands#application-command-object-application-command-structure
    */
    public description!: string;
    public permissions: string[] = [];
    public args: APIApplicationCommandOption[] = [];

    public constructor(public type: CommandType, public name: string, public $commandInit?: Partial<Command>) {
        if ($commandInit) {
            for (const [key, value] of Object.entries($commandInit)) {
                (this as any)[key] = value;
            }
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
    type: CommandType;
    name: string;
    description: string;
    permissions: string[];
    args: APIApplicationCommandOption[];
    
    exec(ctx: Ctx): Promise<void>;
}

class ChatCommand extends Command {
    public constructor(public name: string, public $commandInit?: Partial<Command>) {
        super(CommandType.Chat, name, $commandInit);
    }
}

class UserCommand extends Command {
    public constructor(public name: string, public $commandInit?: Partial<Command>) {
        super(CommandType.User, name, $commandInit);
    }
}

class MessageCommand extends Command {
    public constructor(public name: string, public $commandInit?: Partial<Command>) {
        super(CommandType.Message, name, $commandInit);
    }
}

export {
    Command,
    ChatCommand,
    UserCommand,
    MessageCommand
};