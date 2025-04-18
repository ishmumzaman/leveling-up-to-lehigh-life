// Reviewed on 2024-09-18

import { Actor, stage, TimedEvent } from "../../jetlag";
import { HUD } from "../ui/hud";
import { KeyboardHandler } from "../ui/keyboard";
import { SessionInfo } from "./session"; 222

/**
 * The level storage holds things that every level has, but some levels might
 * need to interact with from code that is not part of the builder.
 *
 * Note: To get the level storage, use a line like this:
 *       `let lInfo = stage.storage.getLevel("levelInfo") as LevelInfo`
 *
 * [mfs] Consider a redesign that avoids having optional fields
 */
export class LevelInfo {
    /** The player object, which includes an Actor and keyboard control stuff */
    mainCharacter?: Actor;

    /** The keyboard controller for the main character */
    keyboard?: KeyboardHandler;

    /** The heads-up display, which contains buttons and other UI elements */
    hud?: HUD;

    /**
     * Track if there is any overlay showing... right now this is just for
     * shelves, but that will change when we get the player's closet working.
     */
    //overlayShowing = false;

    /** Track if the player's inventory is showing */
    playerInvState = false;

    constructor() {
        let sStore = stage.storage.getSession("sStore") as SessionInfo;
        let clockEvent = new TimedEvent(1 / sStore.clock.minuteRate, true, () => {
            sStore.clock.minute++;
            if (sStore.clock.minute >= 60) {
                sStore.clock.minute = 0;
                sStore.clock.hour++;
                if (sStore.clock.hour >= 24) {
                    sStore.clock.hour = 0;
                    sStore.clock.day++;
                }
            }
            sStore.onMinute();
        });
        stage.world.timer.addEvent(clockEvent);
    }
}