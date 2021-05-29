import {
    ISlashCommand,
    SlashCommandContext,
} from "@rocket.chat/apps-engine/definition/slashcommands";
import {
    IHttp,
    IModify,
    IRead,
    IPersistence,
} from "@rocket.chat/apps-engine/definition/accessors";
import { App } from "@rocket.chat/apps-engine/definition/App";
import { setStatusMessage } from "../helpers/statusMessage";
import { initiatorMessage } from "../helpers/initiatorMessage";

export class SttCommand implements ISlashCommand {
    public command = "stt";
    public i18nDescription = "Queues an audio message for transcription";
    public i18nParamsExample = "";
    public providesPreview = false;

    constructor(private readonly app: App) { }

    public async executor(
        context: SlashCommandContext,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persistence: IPersistence
    ): Promise<void> {
        // Gettint the roomId and fileId from slash command arguments and userId from slash command context
        const [rid, fileId, fileName] = context.getArguments()
        // // console.log('These are the context arguments===>>>', { rid, fileId, userId: context.getSender().id })
        // setStatusMessage(modify, context, { rid, fileId, userId: context.getSender().id, senderId })
        // console.log('this is the context', context)

        const sender = context.getSender(); // the user calling the slashcommand
        const room = context.getRoom(); // the current room

        const data = {
            room: room,
            sender: sender,
        };

        await initiatorMessage({ data, modify, message: `"${fileName}" is queued for transcription` });
    }
}
