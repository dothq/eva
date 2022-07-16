# Brand
error-colour = #BF112D

# Errors
error-internal-bot = An error occurred while running /{ $cmd }.

error-too-many-options-picked = Too many options picked; provided { $optionSize }, expected only { $expectedOptionSize }.

error-no-option-picked = No option was picked.

error-option-parse-failed = Failed to parse option.

error-no-permission-single = The { $permission } permission is required to use this command.
error-no-permission-multiple = The { $permission } permissions are required to use this command.

error-no-role = The { $role } permission is required to use this command.

error-unknown-message = Unable to locate message.

error-no-mod-role = No moderator role has been set.

# Updates to identity
updated-username-message = Successfully updated username to { $botname }.
updated-avatar-message = Successfully updated { $botname }'s avatar.

# Reporting
report-confirm-title-msg = Report this message?
report-confirm-description-msg = This report **will not** be tied to your account in any way.
report-confirm-msg-content-field-msg = 💬 Message Content
report-confirm-msg-sent-field-msg = 📨 Sent
report-confirm-msg-id-field-msg = 🆔 ID
report-confirm-msg-attachments-field-msg = 📎 Attachments
report-confirm-author-footer-msg = Author: { $tag } ({ $id })
report-submitted-title = Report submitted successfully.
error-report-message-not-reportable = This message is exempt from being reported.

# Realms
realms-set-channel = Successfully updated Realms channel settings.
realms-channel-name = { $username }'s space
realms-added-user = Added { $username } to space; they can now join.
error-realms-not-in-channel = You aren't in this space; try joining.
error-realms-user-not-in-channel = You aren't in a space right now.
error-realms-cant-add-user = You don't have permission to add this user.
error-realms-cant-remove-user = You don't have permission to remove this user.
error-realms-access-unchanged-permission = You don't have permission to update this space's access.
realms-removed-user = Removed { $username } from space.
realms-changed-access = Your space is now { $state } to the public.
realms-disconnected-no-permission = You were disconnected from { $name } because the space became private.
realms-members-kicked-nobody = Nobody was removed as everyone is allowed to be in the space.
realms-members-kicked-no-permission-on-access-change = The following members were kicked from your space because the space became private: { $list }.
error-realms-joined-realm-channel-meta-incorrect-usage = You are unable to run that command here, try joining the voice channel instead.

# Projects
projects-set-category = Successfully updated projects category settings.

# Support
support-updated-thread-title = Updated thread title.
error-support-failed-thread-title-update = Failed to update thread title.
error-support-not-valid-support-thread = Unable to close thread as it is not a valid support thread.
support-thread-closed-feedback = Thread closed.
support-thread-closed-feedback-description = Which user(s) helped you in solving your issue?
support-thread-closed-feedback-select-option = Select user(s)...
support-thread-closed-feedback-nobody = Nobody
support-thread-closed-feedback-thanks = Thanks for the feedback.

# Roles
error-cannot-add-role-higher-than-current = You cannot add or remove this role as it is higher or the same level as your highest role.
added-role-to-user = Added @{ $rolename } to { $user }.
removed-role-from-user = Removed @{ $rolename } from { $user }.
error-user-does-not-have-role = User does not have this role.
error-user-already-has-role = User already has role.

# 2FA
error-2fa-not-setup = You have not set-up 2FA for this account yet. Run /setup-two-factor in chat to begin set-up.
two-factor-authorised = Authorised this action; your session will expire in 2 minutes.

# Purging messages
purged-chat-messages = Purged { $count } messages.

# Banning & Kicking
cannot-ban-self = You cannot ban yourself.
cannot-kick-self = You cannot kick yourself.
cannot-ban-bot = You cannot ban the bot.
cannot-kick-bot = You cannot kick the bot.
ban-success = Banned { $user } with reason { $reason }.
kick-success = Kicked { $user } with reason { $reason }.

# Permissions
permission-create-instant-invite = Create Invite
permission-kick-members = Kick Members
permission-ban-members = Ban Members
permission-administrator = Administrator
permission-manage-channels = Manage Channels
permission-manage-guild = Manage Server
permission-add-reactions = Add Reactions
permission-view-audit-log = View Audit Log
permission-priority-speaker = Priority Speaker
permission-stream = Video
permission-view-channel = View Channels
permission-send-messages = Send Messages
permission-send-tts-messages = Send Text-to-speech Messages
permission-manage-messages = Manage Messages
permission-embed-links = Embed Links
permission-attach-files = Attach Files
permission-read-message-history = Read Message History
permission-mention-everyone = Mention @everyone, @here and All Roles
permission-use-external-emojis = Use External Emojis
permission-view-guild-insights = View Server Insights
permission-connect = Connect
permission-speak = Speak
permission-mute-members = Mute Members
permission-deafen-members = Deafen Members
permission-move-members = Move Members
permission-use-vad = Use Voice Activity
permission-change-nickname = Change Nickname
permission-manage-nicknames = Manage Nicknames
permission-manage-roles = Manage Roles
permission-manage-webhooks = Manage Webhooks
permission-manage-emojis-and-stickers = Manage Emojis and Stickers
permission-use-application-commands = Use Application Commands
permission-request-to-speak = Request to Speak
permission-manage-threads = Manage Threads
permission-use-public-threads = Use Public Threads
permission-create-public-threads = Create Public Threads
permission-use-private-threads = Use Private Threads
permission-create-private-threads = Create Private Threads
permission-use-external-stickers = Use External Stickers
permission-send-messages-in-threads = Send Messages in Threads
permission-start-embedded-activities = Send Messages in Private Threads
permission-moderate-members = Moderate Member
permission-manage-events = Manage Events