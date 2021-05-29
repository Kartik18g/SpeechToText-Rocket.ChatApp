import {
    IAppAccessors,
    IConfigurationExtend,
    IEnvironmentRead,
    IHttp,
    ILogger,
    IMessageBuilder,
    IModify,
    IPersistence,
    IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { ApiSecurity, ApiVisibility } from '@rocket.chat/apps-engine/definition/api';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IMessage, IPostMessageSent, IPreMessageSentModify } from '@rocket.chat/apps-engine/definition/messages';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { BlockBuilder, ButtonStyle } from '@rocket.chat/apps-engine/definition/uikit';
import { settings } from './config/Settings';
import { webhookEndpoint } from './endpoints/webhookEndpoint';
import { initiatorMessage } from './helpers/initiatorMessage';
import { QueueAudio } from './helpers/QueueAudio';

export class SpeechToTextApp extends App implements IPreMessageSentModify {
    private queueAudio: QueueAudio;
    private appId: string

    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
        console.log('appInfo', info)
        this.queueAudio = new QueueAudio();
        this.appId = info.id
    }



    protected async extendConfiguration(
        configuration: IConfigurationExtend,
        environmentRead: IEnvironmentRead
    ): Promise<void> {

        await Promise.all(settings.map((setting) => configuration.settings.provideSetting(setting)));

        configuration.api.provideApi({
            visibility: ApiVisibility.PUBLIC,
            security: ApiSecurity.UNSECURE,
            endpoints: [new webhookEndpoint(this)],
        });


    }


    public async checkPreMessageSentModify(
        message: IMessage,
        read: IRead,
        http: IHttp
    ): Promise<boolean> {
        if (message.attachments && message.attachments.length > 0) {
            if (message.attachments[0].audioUrl) {
                return true;
            }
        }

        return false;
    }

    async executePreMessageSentModify(
        message: IMessage,
        builder: IMessageBuilder,
        read: IRead,
        http: IHttp,
        persist: IPersistence,
    ): Promise<IMessage> {
        console.log(message)
        const block = new BlockBuilder(this.appId)
        block.addActionsBlock({
            blockId: "sttQueue",
            elements: [
                block.newButtonElement({
                    actionId: "Transcribe",
                    text: block.newPlainTextObject("Transcribe"),
                    value: JSON.stringify('hola'),
                    style: ButtonStyle.PRIMARY,
                }),
            ],
        });

        // const block = builder.addBlocks()

        const msg = builder.addBlocks(block);

        return msg.getMessage()
    }
}
