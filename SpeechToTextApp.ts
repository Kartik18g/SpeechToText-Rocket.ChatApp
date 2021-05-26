import {
    IAppAccessors,
    IConfigurationExtend,
    IEnvironmentRead,
    IHttp,
    ILogger,
    IModify,
    IPersistence,
    IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { ApiSecurity, ApiVisibility } from '@rocket.chat/apps-engine/definition/api';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IMessage, IPostMessageSent } from '@rocket.chat/apps-engine/definition/messages';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { settings } from './config/Settings';
import { webhookEndpoint } from './endpoints/webhookEndpoint';
import { initiatorMessage } from './helpers/initiatorMessage';
import { QueueAudio } from './helpers/QueueAudio';

export class SpeechToTextApp extends App implements IPostMessageSent {
    private queueAudio: QueueAudio;

    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
        this.queueAudio = new QueueAudio();

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


    public async checkPostMessageSent(
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

    public async executePostMessageSent(
        message: IMessage,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify,
    ): Promise<void> {
        // console.log('--->>>postMessageSent', message.attachments && message.attachments[0].audioUrl)
        // this.queueAudio.queue(message, http, read)
        const sender = message.sender; // the user calling the slashcommand
        const room = message.room; // the current room

        const data = {
            room: room,
            sender: sender,
            rid: message.room.id,
            userId: message.sender.id,
            fileId: message.file?._id,
        };


        await initiatorMessage({ data, read, persistence, modify, http });

    }
}
