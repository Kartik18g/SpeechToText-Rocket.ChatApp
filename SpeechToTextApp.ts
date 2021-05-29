import {
    IAppAccessors,
    IConfigurationExtend,
    IEnvironmentRead,
    IHttp,
    ILogger,
    IMessageBuilder,
    IMessageExtender,
    IModify,
    IPersistence,
    IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { ApiSecurity, ApiVisibility } from '@rocket.chat/apps-engine/definition/api';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IMessage, IMessageAttachment, IPostMessageSent, IPreMessageSentExtend, IPreMessageSentModify, MessageActionButtonsAlignment, MessageActionType } from '@rocket.chat/apps-engine/definition/messages';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { BlockBuilder, ButtonStyle } from '@rocket.chat/apps-engine/definition/uikit';
import { SttCommand } from './commands/Transcribe';
import { settings } from './config/Settings';
import { webhookEndpoint } from './endpoints/webhookEndpoint';
import { initiatorMessage } from './helpers/initiatorMessage';
import { QueueAudio } from './helpers/QueueAudio';

export class SpeechToTextApp extends App implements IPreMessageSentExtend {
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
        await configuration.slashCommands.provideSlashCommand(
            new SttCommand(this)
        );


    }


    public async checkPreMessageSentExtend(
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

    async executePreMessageSentExtend(
        message: IMessage,
        extend: IMessageExtender,
        read: IRead,
        http: IHttp,
        persist: IPersistence,
    ): Promise<IMessage> {
        console.log(message)
        const rid = message.room.id
        const fileId = message.file?._id
        const fileName = message.file?.name
        extend.addAttachment({
            actionButtonsAlignment: MessageActionButtonsAlignment.HORIZONTAL,
            actions: [
                {
                    text: 'Transcribe',
                    type: MessageActionType.BUTTON,
                    msg_in_chat_window: true,
                    msg: `/stt ${rid} ${fileId} ${fileName}`,
                },
            ],
        })


        // const block = builder.addBlocks()


        return message
    }
}
