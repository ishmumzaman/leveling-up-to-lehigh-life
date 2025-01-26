import { stage } from "../../jetlag/Stage";
import { AnimatedSprite, FilledCircle, ImageSprite } from "../../jetlag/Components/Appearance";
import { BoxBody, CircleBody } from "../../jetlag/Components/RigidBody";
import { Sensor } from "../../jetlag/Components/Role";
import { Actor } from "../../jetlag/Entities/Actor";
import { SStore } from "../StorageSystems/SStore";
import { renderStat } from "../PlayerSystems/stat";
import { renderPlayerInventory, renderShelfInventory } from "../PlayerSystems/inventory"
import { centerBoundBox } from "../WorldSystems/boundBox";
import { GameItems } from "../WorldSystems/item";
import { LStore } from "../StorageSystems/LStore";
import { StaticSpawner } from "../WorldSystems/spawner";
import { AlarmFilter, ColorFilter, FadeOutFilterComponent } from "../WorldSystems/filter";
import { SpriteLocation, TimedEvent } from "../../jetlag";
import { Player } from "../PlayerSystems/player";
import { makeSimpleAnimation } from "../PlayerSystems/character";
import { DialogueSystem, InspectSystem } from "../PlayerSystems/dialogue";
import { NPC } from "../WorldSystems/NPC";
import { HUD } from "../PlayerSystems/hud";
import { makeCustomCharAnimation } from "../PlayerSystems/characterCustomization";

/**
 * Build the levels of the game.
 *
 * @param level Which level should be displayed
 */
export function fmlBuilder(_level: number) {
    // level 
    let lStore = new LStore();
    stage.storage.setLevel("stats", lStore);

    // session storage
    if (!stage.storage.getSession("sStore")) stage.storage.setSession("sStore", new SStore());
    let sStore = stage.storage.getSession("sStore") as SStore;
    if (!sStore.player) new Player();

    sStore.player!.spawnPlayer(8, 4.5);
    if (_level == 1) {
        centerBoundBox(8, 4.5, 16, 9);
        stage.world.camera.setBounds(0, 0, 16, 9);

        new HUD(false, true, true);

        sStore.gameInvs.playerInv.addItem(GameItems.getItem("water"));
        sStore.gameInvs.playerInv.addItem(GameItems.getItem("kettleChips"));
        sStore.gameInvs.playerInv.addItem(GameItems.getItem("donutBox"));

        let door = new InspectSystem("mmDorm", "closet");
        door.queueInspect("default");
        //let idk = new StaticSpawner(1, 4.5, 1, 1, "exmark.png", true, mainChar.getPlayerActor(), () => { door.nextInspectConvo(); });


        // background
        new Actor({
            appearance: new ImageSprite({ width: 16, height: 9, img: "locBg/fmlEntrance.png", z: -1 }),
            rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 16, height: 9 }, { collisionsEnabled: false }),
        });
    }
}