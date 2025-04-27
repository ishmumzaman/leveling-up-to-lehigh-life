import { Actor, AdvancedCollisionService, BoxBody, FilledBox, Sensor, stage } from "../../jetlag";
import { GameItems, Item, Items } from "../inventory/item";
import { LevelInfo } from "../storage/level";
import { SessionInfo } from "../storage/session";
import { KeyboardHandler } from "../ui/keyboard";
import { getRegularDir, makeMainCharacter } from "./character";
import { CharacterAnimations, CharacterPart, makeItemSprite, TxID } from "./characterCustomization";

/**
 * Create a zone where the player can change their outfit
 *
 * @param cx center x position of the zone
 * @param cy center y position of the zone
 * @param w width of the zone
 * @param h height of the zone
 */
export function makeChangeZone(cx: number, cy: number, w: number, h: number) {
    let lInfo = stage.storage.getLevel("levelInfo") as LevelInfo;

    const zone = new Actor({
        appearance: [new FilledBox({ width: 0, height: 0, fillColor: "#00FFFFFF" })],
        rigidBody: new BoxBody({ cx: cx, cy: cy, width: w, height: h }),
        role: new Sensor({
            heroCollision: (a, c) => {
                lInfo.hud!.inventory.canChangeOutfit = true;
                (stage.world.physics as AdvancedCollisionService).addEndContactHandler(zone, lInfo.mainCharacter!, () => {
                    lInfo.hud!.inventory.canChangeOutfit = lInfo.mainCharacter !== c;
                });
            }
        })
    });
}
/**
 * All items that are related to clothing should go through this so they can be assigned a CharacterPart
 * The CharacterPart carries information that will help the game know how to change the player's appearance when the player equips a new clothing item
 * Additionally, notice how ChracterPart.texture is not used to render the item (we have item.img for that), but CharacterPart.oldColor and ChracterPart.newColor are.
 * This helps us reflect the customized colors of clothing when they are rendered as items in the inventory.
 *
 * @param part The CharacterPart to be attached to an Item
 */
export function partToItem(part: CharacterPart): Item {
    let texture = part.texture;
    let item: Item
    // We use GameItems.getItem extract the description and image name of the item
    if (texture in Items) item = GameItems.getItem(Items[texture as keyof typeof Items]);
    else throw ("Invalid enum key for Items " + texture);

    // Use the image of the item to make a corresponding sprite so we can use color filters on it
    item.img = makeItemSprite(item.img as string, part.originalColor, part.newColor);
    item.charPart = part;
    return item;
}

/**
 * Update the player's ingame appearance based on the given parameters
 *
 * @param newHair New hair texture
 * @param newAccessory  New accessory texture
 * @param newOutfit New outfit texture
 */
export function changePlayerAppearance(newHair?: CharacterPart, newAccessory?: CharacterPart, newOutfit?: CharacterPart) {
    let lInfo = stage.storage.getLevel("levelInfo") as LevelInfo;
    let sStore = stage.storage.getSession("sStore") as SessionInfo;
    let newConfig = sStore.playerAppearance.config.clone();

    if (newHair) newConfig.hair = newHair
    newConfig.accessory = newAccessory ? newAccessory : new CharacterPart(TxID.None, [], []);
    if (newOutfit) newConfig.outfit = newOutfit;

    sStore.goToX = lInfo.mainCharacter!.rigidBody.getCenter().x;
    sStore.goToY = lInfo.mainCharacter!.rigidBody.getCenter().y;

    lInfo.mainCharacter!.enabled = false

    sStore.playerAppearance = new CharacterAnimations(newConfig);
    let player = makeMainCharacter(0, 0, sStore.playerAppearance, getRegularDir(lInfo.mainCharacter!));
    stage.world.camera.setCameraFocus(player);
    lInfo.mainCharacter = player;
    lInfo.keyboard = new KeyboardHandler(player);
}