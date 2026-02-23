module.exports = [
    {
        "type": "heading",
        "defaultValue": "E2EE Clock - Settings"
    },
    {
        "type": "text",
        "defaultValue": "Let's make end-to-end encryption the default!"
    },
    {
        "type": "section",
        "items": [
            {
                "type": "heading",
                "defaultValue": "Colors"
            },
            {
                "type": "color",
                "messageKey": "BackgroundColor",
                "defaultValue": "0x0000AA",
                "label": "Background Color",
                "sunlight": true
            },
            {
                "type": "color",
                "messageKey": "TextColor",
                "defaultValue": "0xFFFFFF",
                "label": "Text Color"
            }
        ]
    },
    {
        "type": "section",
        "items": [
            {
                "type": "heading",
                "defaultValue": "Preferences"
            },
            {
                "type": "toggle",
                "messageKey": "HourFormat",
                "label": "Use 24-Hour Format",
                "defaultValue": true
            }
        ]
    },
    {
        "type": "submit",
        "defaultValue": "Save Settings"
    }
];