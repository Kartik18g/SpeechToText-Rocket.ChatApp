import { IHttp, ILogger, IModify, IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { IMessage } from "@rocket.chat/apps-engine/definition/messages";
import { generateJWT } from './JWTHelper'


export class QueueAudio {

    public host = "http://localhost:3000"


    public async queue(message: IMessage, http: IHttp, read: IRead, modify: IModify): Promise<void> {


        const api_key: string = await read
            .getEnvironmentReader()
            .getSettings()
            .getValueById("api-key");
        const api_provider: string = await read
            .getEnvironmentReader()
            .getSettings()
            .getValueById("api-provider");
        console.log(api_key, api_provider)

        // console.log('Messagesentpostfromapp-->>', message)
        console.log(message.room.id)
        console.log(message.sender.id)
        console.log(message.file?._id)

        try {

            if (api_key && api_provider) {
                // Get attachment using Imessage
                const attachment = message.attachments;
                const audioUrl = attachment && attachment[0].audioUrl;
                // Use JWT helper to get generate the token
                var jwtToken = generateJWT({
                    typ: 'JWT',
                    alg: 'HS256',
                }, {
                    rid: message.room.id,
                    userId: message.sender.id,
                    fileId: message.file?._id,
                    secret: "Pia"
                }, 'Pia')
                // Appending the JWT token to audioURL and getting the final recording URL which is to be sent to the provider
                var recordingUrl = `${this.host}${audioUrl}?token=${jwtToken}`;
                var webhook_url = `${this.host}/api/apps/public/3a114905-2e8f-4d32-9133-fc668c048dbd/stt-webhook`;

                var provider = api_provider;

                console.log('PublicURLyeHai', recordingUrl)
                var reqUrl, body;
                try {
                    switch (provider) {
                        case "Assembly":
                            reqUrl = "https://api.assemblyai.com/v2/transcript";
                            body = {
                                audio_url: recordingUrl,
                                webhook_url,
                            };
                            var response = await http.post(reqUrl, {
                                data: {
                                    audio_url: recordingUrl,
                                    webhook_url,
                                },
                                headers: {
                                    ["authorization"]: `${api_key}`,
                                    ["content-type"]: "application/json",
                                },
                            });

                            console.log(response.data);
                            break;
                    }
                } catch (err) {
                    console.log(err);
                }
            } else {
                console.log("api keys toh daalde lawdeya");
            }
        } catch (error) {
            console.log(error)
        }
    }

    public test() {
        console.log("hifromadp")
    }
}

function generateJWTfunc(generateJWTfunc: any) {
    throw new Error("Function not implemented.");
}

