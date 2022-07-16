import { APIApplicationCommandOption, APIMessage } from "discord-api-types/v10";
import { BaseCommandInteraction, ButtonInteraction, ContextMenuInteraction, Interaction, InteractionReplyOptions, Message, MessageContextMenuInteraction, ModalSubmitInteraction, PermissionFlags, Permissions, Role, SelectMenuInteraction } from "discord.js";
import { l10n, log } from "../main";
import { replyWithError } from "../util/error";
import { hasPermission } from "../util/permissions";

export type Ctx = BaseCommandInteraction & MessageContextMenuInteraction & ContextMenuInteraction & ButtonInteraction & ModalSubmitInteraction;

export enum CommandType {
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
    public roles: Role[] = [];
    public args: APIApplicationCommandOption[] = [];

    public constructor(public type: CommandType, public name: string, public $commandInit?: Partial<Command>) {
        if ($commandInit) {
            for (const [key, value] of Object.entries($commandInit)) {
                (this as any)[key] = value;
            }
        }
    }

    public async handler(ctx: Ctx) {
        const hasPerm = await hasPermission(ctx, this);
        if (!hasPerm) return;

        return (this as any).exec(ctx);
    }
}

interface Command {
    type: CommandType;
    name: string;
    description: string;
    permissions: string[];
    roles: Role[];
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