import * as Discord from "discord.js"
import { Ctx } from "../commands";
import { l10n } from "../main";
import { replyWithError } from "./error";

export const Permissions: Record<keyof Discord.PermissionFlags, keyof Discord.PermissionFlags> = {
    "CREATE_INSTANT_INVITE": "CREATE_INSTANT_INVITE",
    "KICK_MEMBERS": "KICK_MEMBERS",
    "BAN_MEMBERS": "BAN_MEMBERS",
    "ADMINISTRATOR": "ADMINISTRATOR",
    "MANAGE_CHANNELS": "MANAGE_CHANNELS",
    "MANAGE_GUILD": "MANAGE_GUILD",
    "ADD_REACTIONS": "ADD_REACTIONS",
    "VIEW_AUDIT_LOG": "VIEW_AUDIT_LOG",
    "PRIORITY_SPEAKER": "PRIORITY_SPEAKER",
    "STREAM": "STREAM",
    "VIEW_CHANNEL": "VIEW_CHANNEL",
    "SEND_MESSAGES": "SEND_MESSAGES",
    "SEND_TTS_MESSAGES": "SEND_TTS_MESSAGES",
    "MANAGE_MESSAGES": "MANAGE_MESSAGES",
    "EMBED_LINKS": "EMBED_LINKS",
    "ATTACH_FILES": "ATTACH_FILES",
    "READ_MESSAGE_HISTORY": "READ_MESSAGE_HISTORY",
    "MENTION_EVERYONE": "MENTION_EVERYONE",
    "USE_EXTERNAL_EMOJIS": "USE_EXTERNAL_EMOJIS",
    "VIEW_GUILD_INSIGHTS": "VIEW_GUILD_INSIGHTS",
    "CONNECT": "CONNECT",
    "SPEAK": "SPEAK",
    "MUTE_MEMBERS": "MUTE_MEMBERS",
    "DEAFEN_MEMBERS": "DEAFEN_MEMBERS",
    "MOVE_MEMBERS": "MOVE_MEMBERS",
    "USE_VAD": "USE_VAD",
    "CHANGE_NICKNAME": "CHANGE_NICKNAME",
    "MANAGE_NICKNAMES": "MANAGE_NICKNAMES",
    "MANAGE_ROLES": "MANAGE_ROLES",
    "MANAGE_WEBHOOKS": "MANAGE_WEBHOOKS",
    "MANAGE_EMOJIS_AND_STICKERS": "MANAGE_EMOJIS_AND_STICKERS",
    "USE_APPLICATION_COMMANDS": "USE_APPLICATION_COMMANDS",
    "REQUEST_TO_SPEAK": "REQUEST_TO_SPEAK",
    "MANAGE_THREADS": "MANAGE_THREADS",
    "USE_PUBLIC_THREADS": "USE_PUBLIC_THREADS",
    "CREATE_PUBLIC_THREADS": "CREATE_PUBLIC_THREADS",
    "USE_PRIVATE_THREADS": "USE_PRIVATE_THREADS",
    "CREATE_PRIVATE_THREADS": "CREATE_PRIVATE_THREADS",
    "USE_EXTERNAL_STICKERS": "USE_EXTERNAL_STICKERS",
    "SEND_MESSAGES_IN_THREADS": "SEND_MESSAGES_IN_THREADS",
    "START_EMBEDDED_ACTIVITIES": "START_EMBEDDED_ACTIVITIES",
    "MODERATE_MEMBERS": "MODERATE_MEMBERS",
    "MANAGE_EVENTS": "MANAGE_EVENTS",
};

export const hasPermission = async (ctx: Ctx, options: { permissions?: string[], roles?: Discord.Role[] }) => {
    return new Promise((resolve) => {
        let hasPerm = true;
        let hasRole = true;

        if (options.permissions && options.permissions.length) {
            hasPerm = false;

            for (const permission of options.permissions) {
                const bitflag = (Discord.Permissions.FLAGS as any)[permission];
    
                if (ctx.memberPermissions?.has(bitflag)) {
                    hasPerm = true;
                    break;
                }
            }
    
            if (ctx.member?.user.id == ctx.guild?.ownerId) {
                hasPerm = true;
            }
    
            if (!hasPerm) {
                const isSingle = options.permissions.length == 1;
    
                const toKebabCase = (t: string) => {
                    return t.replace(/_/g, "-").toLowerCase();
                }
    
                const locale = l10n.locale(ctx);
    
                const listFormatter = new Intl.ListFormat(locale, { style: "long", type: "disjunction" });
                const permission = isSingle 
                    ? l10n.t(ctx, `permission-${toKebabCase(options.permissions[0])}`)
                    : listFormatter.format(options.permissions.map(p => l10n.t(ctx, `permission-${toKebabCase(p)}`)))
    
                replyWithError(ctx, `no-permission-${isSingle ? "single" : "multiple"}`, { 
                    permission
                }).send();

                return resolve(false);
            }
        }
    
        if (options.roles && options.roles.length) {
            hasRole = false;

            for (const role of options.roles) {
                if (role.members.has(ctx.member?.user.id as string)) {
                    hasRole = true;
                }
            }
    
            if (ctx.member?.user.id == ctx.guild?.ownerId) {
                hasRole = true;
            }
    
            if (!hasRole) {
                replyWithError(ctx, "no-role", { 
                    role: options.roles[0].name
                }).send();

                return resolve(false);
            }
        }

        return resolve(hasPerm || hasRole);
    })
}