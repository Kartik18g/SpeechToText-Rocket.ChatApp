import { IModify } from "@rocket.chat/apps-engine/definition/accessors";
import { SlashCommandContext } from "@rocket.chat/apps-engine/definition/slashcommands";

export const setStatusMessage = async (modify: IModify, context: SlashCommandContext, data) => {
    const { rid, fileId, userId, senderId } = data;
    const room = context.getRoom()
    const message = await modify.getCreator().startMessage();
    message
        .setRoom(room)
        .setEmojiAvatar(":stt:")
        .setText("Your ")
        .setGroupable(false);

    // if (room.type !== "l") {
    //     modify.getCreator().finish(message);

    // } else {
    //     modify.getCreator().finish(message);
    // }
    console.log(room.type)

    if (room.type !== "l") {
        await modify
            .getNotifier()
            .notifyUser(userId, message.getMessage());
    } else {
        await modify.getCreator().finish(message);
    }


}
