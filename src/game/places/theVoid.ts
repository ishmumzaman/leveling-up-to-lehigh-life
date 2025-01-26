import { stage } from "../../jetlag/Stage";
import { SessionInfo } from "../storage/session";
import { AnimationState } from "../../jetlag";
import { LevelInfo } from "../storage/level";
import { HUD } from "../ui/hud";
import { makeMainCharacter } from "../characters/character";
import { KeyboardHandler } from "../ui/keyboard";
import { NpcNames, spawnRegularNpc, NpcBehavior } from "../characters/NPC";
import { Places } from "./places";
import { FindRathBone } from "../quests/FindRathBone";

/**
 * A testing builder for new features and ideas.
 */
export function voidBuilder(level: number) {
    if (!stage.storage.getSession("sStore")) stage.storage.setSession("sStore", new SessionInfo());
    let sStore = stage.storage.getSession("sStore") as SessionInfo;

    let lInfo = new LevelInfo();
    stage.storage.setLevel("levelInfo", lInfo);
    lInfo.hud = new HUD("Void", "Void");

    if (level == 0) {
        // Create player and their respective NPC for dialogue
        let player = makeMainCharacter(8, 7, sStore.playerAppearance!, AnimationState.IDLE_W);
        lInfo.mainCharacter = player;
        stage.world.camera.setCameraFocus(player);
        lInfo.keyboard = new KeyboardHandler(player);

        let martina = spawnRegularNpc(NpcNames.Martina, 4.4, 5.4, AnimationState.IDLE_S);
        let jake = spawnRegularNpc(NpcNames.Jake, 8, 5.4, AnimationState.IDLE_S);

        sStore.currQuest = new FindRathBone();
        sStore.currQuest?.onBuildPlace(Places.THE_VOID, level);
        sStore.currQuest?.onMakeNpc(Places.THE_VOID, level, martina);
        sStore.currQuest?.onMakeNpc(Places.THE_VOID, level, jake);
    }

}   