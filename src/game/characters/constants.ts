import { ColorPallette, HexColor, Attribute } from "./characterCustomization";

/**
 * Information about how to display an icon for a character customization attribute
 * or options under an attribute.
 */
class IconDisplay {
    /**
     * Create a new IconDisplay
     *
     * @param file the image file to display
     * @param w the width of the icon
     * @param h the height of the icon
     * @param ox the x offset of the icon
     * @param oy the y offset of the icon
     * @param displayName the name to display for the icon
     */
    constructor(public file: string, public w: number, public h: number, public ox: number, public oy: number, public displayName?: string) { }
}

/** Contains all information about the atribute icons in character customization */
export const attributeIconData: Map<Attribute, IconDisplay> = new Map([
    [Attribute.BODY, new IconDisplay("body03PTTalk0.png", 2.3, 2.3, 0.05, 0.1)],
    [Attribute.EYES, new IconDisplay("eye.png", 1, 1, 0, 0)],
    [Attribute.OUTFIT, new IconDisplay("outfit01IdleS0.png", 1.2, 2.4, 0, -0.7)],
    [Attribute.HAIR, new IconDisplay("hair04PTTalk0.png", 1.9, 1.9, 0.05, 0.1)],
    [Attribute.ACCESSORY, new IconDisplay("snapback04PTTalk0.png", 2, 2, 0.12, 0.3)]
]);

/** Contains all information about the option icons under a selected attribute in character customization */
export const optionIconData: Map<Attribute, Map<string, IconDisplay>> = new Map([
    [Attribute.BODY, new Map()],
    [Attribute.EYES, new Map()],
    [Attribute.OUTFIT, new Map([
        ["outfit01", new IconDisplay("outfit01IdleS0.png", 0.8, 1.6, 0, -0.5, "T-Shirt")],
        ["outfit02", new IconDisplay("outfit02IdleS0.png", 0.8, 1.6, 0, -0.5, "Jacket")],
        ["outfit03", new IconDisplay("outfit03IdleS0.png", 0.8, 1.6, 0, -0.5, "T-Shirt")],
        ["outfit04", new IconDisplay("outfit04IdleS0.png", 0.8, 1.6, 0, -0.5, "T-Shirt")],
        ["outfit07", new IconDisplay("outfit07IdleS0.png", 0.8, 1.6, 0, -0.5, "Jacket")],
        ["outfit10", new IconDisplay("outfit10IdleS0.png", 0.8, 1.6, 0, -0.5, "Hoodie")],
        ["outfit11", new IconDisplay("outfit11IdleS0.png", 0.8, 1.6, 0, -0.5, "Shirt")],
        ["outfit14", new IconDisplay("outfit14IdleS0.png", 0.8, 1.6, 0, -0.5, "T-Shirt")],
    ])],
    [Attribute.HAIR, new Map([
        ["", new IconDisplay("overlay/closeButton.png", 0.5, 0.5, 0, 0.01)],
        ["hair01", new IconDisplay("hair01PTTalk0.png", 1.5, 1.5, 0.05, 0.1)],
        ["hair03", new IconDisplay("hair03PTTalk0.png", 1.5, 1.5, 0.05, 0.1)],
        ["hair04", new IconDisplay("hair04PTTalk0.png", 1.2, 1.2, 0.04, 0.08)],
        ["hair05", new IconDisplay("hair05PTTalk0.png", 1.5, 1.5, 0.05, 0.1)],
        ["hair09", new IconDisplay("hair09PTTalk0.png", 1.5, 1.5, 0.05, 0.1)],
        ["hair10", new IconDisplay("hair10PTTalk0.png", 1.5, 1.5, 0.05, 0.1)],
        ["hair11", new IconDisplay("hair11PTTalk0.png", 1.5, 1.5, 0.05, 0.1)],
        ["hair12", new IconDisplay("hair12PTTalk0.png", 1.5, 1.5, 0.05, 0.1)],
        ["hair15", new IconDisplay("hair15PTTalk0.png", 1.5, 1.5, 0.05, 0.1)],
        ["hair18", new IconDisplay("hair18PTTalk0.png", 1.5, 1.5, 0.05, 0.1)],
        ["hair19", new IconDisplay("hair19PTTalk0.png", 1.5, 1.5, 0.05, 0.1)],
        ["hair22", new IconDisplay("hair22PTTalk0.png", 1.5, 1.5, 0.05, 0.1)],
        ["hair24", new IconDisplay("hair24PTTalk0.png", 1.5, 1.5, 0.05, 0.1)],
        ["hair25", new IconDisplay("hair25PTTalk0.png", 1.5, 1.5, 0.05, 0.1)],
    ])],
    [Attribute.ACCESSORY, new Map([
        ["", new IconDisplay("overlay/closeButton.png", 0.5, 0.5, 0, 0.01)],
        ["snapback04", new IconDisplay("snapback04PTTalk0.png", 1.5, 1.5, 0.12, 0.3)],
        ["beanie01", new IconDisplay("beanie01PTTalk0.png", 1.5, 1.5, 0.12, 0.3)],
        ["beard01", new IconDisplay("beard01PTTalk0.png", 1.5, 1.5, 0.12, 0.3)],
        ["glasses01", new IconDisplay("glasses01PTTalk0.png", 1.5, 1.5, 0.12, 0.3)],
    ])]
]);

/** Contains all information about the pallette icons under a selected option in character customization
 * For body and eyes, "" signify a default pallette because they do not have options.
 * For hair, and accessory, "" signify no option has been selected and there is no pallettes.
 */
export const palletteIconData: Map<Attribute, Map<string, { originalColor: HexColor[], pallettes: ColorPallette[] }>> = new Map([
    [Attribute.BODY, new Map([
        ["", {
            // We're using body03 asd our default body
            // The 5 orginal color values below make up the different shadings on that body, from the lightess to the darkess shade
            originalColor: [0xffcca8, 0xffb893, 0xf69784, 0xe07070, 0xbe6864],
            pallettes: [
                new ColorPallette("#ffcbb0", [0xffdbba, 0xffcbb0, 0xf6ae9f, 0xe78078, 0xbe6864]), //body02
                new ColorPallette("#ffb893", [0xffcca8, 0xffb893, 0xf69784, 0xe07070, 0xbe6864]), //body03
                new ColorPallette("f0ae80", [0xf5c796, 0xf0ae80, 0xe6976d, 0xcb794d, 0xc16549]), //body07
                new ColorPallette("bb845c", [0xc29465, 0xbb845c, 0xb77455, 0xb65c44, 0xa14639]), //body04
                new ColorPallette("#bf8b78", [0xc49d85, 0xbf8b78, 0xb57972, 0xaa5e56, 0x924444]), //body01
            ]
        }]
    ])],
    [Attribute.EYES, new Map([
        ["", {
            originalColor: [0x674d49, 0x7b5852],
            pallettes: [
                new ColorPallette("#674d49", [0x674d49, 0x7b5852]), //eyes01
                new ColorPallette("#568d61", [0x568d61, 0x568d61]), //eyes02
                new ColorPallette("#a7b24e", [0xa7b24e, 0xa7b24e]), //eyes03
                new ColorPallette("#71749b", [0x71749b, 0x71749b]), //eyes04
                new ColorPallette("#a6600c", [0xa6600c, 0xa6600c]), //eyes05
                new ColorPallette("#3888bb", [0x3888bb, 0x3888bb]), //eyes06
                new ColorPallette("#3ccbf4", [0x3ccbf4, 0x3ccbf4]), //eyes07
                new ColorPallette("#3a3a50", [0x3a3a50, 0x3a3a50]),
            ]
        }],
    ])],
    [Attribute.OUTFIT, new Map([
        ["outfit01", {
            originalColor: [0xC1D2EE, 0xA6B6E9],
            pallettes: [
                new ColorPallette("#A65211", [0xA65211, 0xEC8E45]),
                new ColorPallette("#6A49AB", [0x6A49AB, 0xC4A1E3])
            ]
        }],
        ["outfit02", {
            originalColor: [0x2EC0D9, 0x4497A9],
            pallettes: [
                new ColorPallette("#A4ADB6", [0xA4ADB6, 0xE7EBEE]),
                new ColorPallette("#17642A", [0x17642A, 0x3DB65B])
            ]
        }],
        ["outfit10", {
            // [anh] There are some weird color bugs that I have found, here are some color sets as examples:
            // 1:   originalColor: [0x9DC98D, 0x090A0B] newColor: [0x090A0B, 0xFFFFFF]
            // 2:   originalColor: [0x9DC98D]           newColor: [0x090A0B]
            // 3:   originalColor: [0x090A0B]           newColor: [0xFFFFFF]
            // 4:   originalColor: [0x9DC98D, 0x000000] newColor: [0x000000, 0xFFFFFF]
            // - Notice how set 1 = set 2 + set 3. Putting in 1 and 3 shows the same result, meaning 1 is ignoring the
            //   replacement effect you would get with set 2 within it.
            // - Set 4 is similar to set 1, but with 0x000000 in place of 0x090A0B. The difference is the color filters now
            //   do nothing when putting in set 4.
            // There could be more bugs, but I have not found them yetC.
            originalColor: [0x9DC98D],
            pallettes: [
                new ColorPallette("#000000", [0x090A0B]),
            ]
        }],
    ])],
    [Attribute.HAIR, new Map([
        ["", {
            originalColor: [],
            pallettes: []
        }],
    ])],
    [Attribute.ACCESSORY, new Map([
        ["", {
            originalColor: [],
            pallettes: []
        }],
        ["snapback04", {
            originalColor: [0xB1BAC8, 0x3A3A50],
            pallettes: [
                new ColorPallette("#1A2B3C", [0x1A2B3C, 0x1A2B3C]),
                new ColorPallette("#FF5733", [0xFF5733, 0xFF5733])
            ]
        }]
    ])]
]);