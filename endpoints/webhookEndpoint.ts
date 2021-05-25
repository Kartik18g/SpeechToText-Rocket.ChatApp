import {
    IHttp,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import {
    ApiEndpoint,
    IApiEndpointInfo,
    IApiRequest,
    IApiResponse,
} from "@rocket.chat/apps-engine/definition/api";

export class webhookEndpoint extends ApiEndpoint {
    public path = "stt-webhook";

    async post(
        request: IApiRequest,
        endpoint: IApiEndpointInfo,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persis: IPersistence
    ): Promise<IApiResponse> {
        this.app.getLogger().debug(request.content);
        const message = await modify.getCreator().startMessage();

        const sender = await read.getUserReader().getById("rocket.cat");
        const room = await read.getRoomReader().getById("GENERAL");
        if (!room) {
            throw new Error("No room is configured to send message");
        }

        message
            .setSender(sender)
            .setRoom(room)
            .setText("Your transcription is complete")
            .setGroupable(false);

        modify.getCreator().finish(message);
        return this.success();
    }
}
