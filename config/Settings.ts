import { ISetting, SettingType } from '@rocket.chat/apps-engine/definition/settings';



export const settings: Array<ISetting> = [
    {
        id: "api-provider",
        i18nLabel: "API Provider",
        i18nDescription: "Select you API provider",
        required: true,
        type: SettingType.SELECT,
        public: true,
        packageValue: "",
        values: [
            {
                key: "Assembly",
                i18nLabel: "Assembly AI",
            },
            {
                key: "Rev",
                i18nLabel: "Rev.AI",
            },
            {
                key: "Google",
                i18nLabel: "Google Text to Speech API",
            },
        ],
    },
    {
        id: "api-key",
        i18nLabel: "API Key",
        i18nDescription: "Provide your API key here",
        required: true,
        type: SettingType.STRING,
        public: true,
        packageValue: "XXXXXXXXXX",
    }
];
