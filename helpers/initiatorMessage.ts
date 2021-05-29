import {
    IModify,
} from "@rocket.chat/apps-engine/definition/accessors";

export async function initiatorMessage({
    data,
    modify,
    message,
}: {
    data;
    modify: IModify;
    message: string
}) {
    const msg = await modify
        .getCreator()
        .startMessage()
        .setEmojiAvatar(":stt:")
        .setUsernameAlias("SpeechToText-BOT")
        .setRoom(data.room)
        .setText(`${message}`);

    // Notifier not applicable to LiveChat Rooms
    if (data.room.type !== "l") {
        await modify
            .getNotifier()
            .notifyUser(data.sender, msg.getMessage());
    } else {
        await modify.getCreator().finish(msg);
    }

}
