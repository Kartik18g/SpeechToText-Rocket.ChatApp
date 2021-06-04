import { IHttp, ILogger, IModify, IRead } from "@rocket.chat/apps-engine/definition/accessors";
import { IMessage } from "@rocket.chat/apps-engine/definition/messages";
import { generateJWT, getPayload } from './JWTHelper'


export class QueueAudio {

    public host = "http://a6054ffebbd5.ngrok.io"


    public async queue(rid, fileId, messageId, userId, audioUrl, http: IHttp, read: IRead): Promise<void> {


        const api_key: string = await read
            .getEnvironmentReader()
            .getSettings()
            .getValueById("api-key");
        const api_provider: string = await read
            .getEnvironmentReader()
            .getSettings()
            .getValueById("api-provider");

        // console.log('Messagesentpostfromapp-->>', message)


        try {

            if (api_key && api_provider) {
                // Get attachment using Imessage
                // Use JWT helper to get generate the token
                var jwtToken = generateJWT({
                    typ: 'JWT',
                    alg: 'HS256',
                }, {
                    rid,
                    userId,
                    fileId,
                    messageId,
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
                console.log("Please provide the API keys");
            }
        } catch (error) {
            console.log(error)
        }
    }

    public async getTranscription(tid: string, http: IHttp, read: IRead): Promise<void> {
        const reqUrl = `https://api.assemblyai.com/v2/transcript/${tid}`
        const api_key: string = await read
            .getEnvironmentReader()
            .getSettings()
            .getValueById("api-key");
        var response = await http.get(reqUrl, {
            headers: {
                ["authorization"]: `${api_key}`,
                ["content-type"]: "application/json",
            },
        });

        const data = response.data
        const { audio_url, text } = data
        console.log({ audio_url, text })

        const token = audio_url.split('token=')[1]

        const payload = getPayload(token.split("&")[0])
        const { messageId } = payload.context

    }
}
