import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { ButtonStyle } from "@rocket.chat/apps-engine/definition/uikit";

export async function initiatorMessage({
    data,
    read,
    persistence,
    modify,
    http,
}: {
    data;
    read: IRead;
    persistence: IPersistence;
    modify: IModify;
    http: IHttp;
}) {

    const builder = await modify.getCreator().startMessage().setRoom(data.room);

    const block = modify.getCreator().getBlockBuilder();

    block.addActionsBlock({
        blockId: "sttQueue",
        elements: [
            block.newButtonElement({
                actionId: "queueAudio",
                text: block.newPlainTextObject("Transcribe"),
                value: JSON.stringify(data),
                style: ButtonStyle.PRIMARY,
            }),

        ],
    });

    builder.setBlocks(block);
    await modify.getCreator().finish(builder);
}
