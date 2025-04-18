import { Actor, stage, TimedEvent } from "../../jetlag";
import { Quest } from "./questLogic";
import { LevelInfo } from "../storage/level";
import { QuestNames } from "./questNames";
import { Places } from "../places/places";
import { NpcNames, NpcBehavior } from "../characters/NPC";
import { SessionInfo } from "../storage/session";
import { DialogueDriver } from "../interactions/dialogue";
import { give_jake_direction, jake_ask_direction, jake_has_direction, jake_waiting_direction as jake_wait_direction } from "../interactions/jakeDlg";
import { martina_can_give_direction } from "../interactions/martinaDlg";

/**
 * This quest is about helping Jake find Rathbone by getting directions from Martina.
 * The actual purpose of the quest is to test the foorprints system from the dialogue system.
 */
export class FindRathBone extends Quest {
    /**
     * Track the player's progress through the quest:
     * 0. You have not been asked by Jake about Rathbone
     * 1. Jake has asked you about Rathbones
     * 2. Martina has given you direction to Rathbone
     * 3. You have given Jake direction to Rathbone
     */
    private progress = 0;
    private footprints: Set<number> = new Set();
    // NPCs
    // footprintLog is used to track the footprints of all past chosen responses for each NPC
    private jake: { npc?: NpcBehavior, driver?: DialogueDriver, footprintLog: Set<number> } = { footprintLog: new Set() };
    private martina: { npc?: NpcBehavior, driver?: DialogueDriver, footprintLog: Set<number> } = { footprintLog: new Set() };

    constructor() {
        super(QuestNames.FindRathBone, "Get Rathbone's direction", "Jake needs help to get to Rathbone!", []);
    }

    onBuildPlace(place: Places, level: number): void {
        let lInfo = stage.storage.getLevel("levelInfo") as LevelInfo;
        let sStore = stage.storage.getSession("sStore") as SessionInfo;
    }

    onMakeNpc(place: Places, level: number, npc: Actor): void {

        if ((npc.extra as NpcBehavior).name == NpcNames.Martina) this.martina.npc = npc.extra as NpcBehavior;
        if ((npc.extra as NpcBehavior).name == NpcNames.Jake) this.jake.npc = npc.extra as NpcBehavior;

        // Make sure both NPCs are loaded before setting up their dialogues
        if (this.jake.npc && this.martina.npc) {
            let m_endFunc = (footprints_: Set<number>) => {
                // Record the footprints of the chosen responses before changing drivers
                this.martina.footprintLog = new Set([...footprints_, ...this.martina.footprintLog]);

                // Determine the next driver for Martina and Jake based on the progress and footprints
                if (this.progress == 1) {
                    this.jake.driver = new DialogueDriver(jake_wait_direction, "start", j_endFunc);
                    this.martina.driver = new DialogueDriver(martina_can_give_direction, "start", m_endFunc);
                }

                if (this.progress == 1 && this.martina.footprintLog.has(1) || this.progress == 2) {
                    this.progress = 2;
                    this.jake.driver = new DialogueDriver(give_jake_direction, "start", j_endFunc);
                    this.martina.driver = new DialogueDriver(martina_can_give_direction, "start", m_endFunc);
                }

                this.jake.npc!.setNextDialogue(this.jake.driver);
                this.martina.npc!.setNextDialogue(this.martina.driver);
            }

            let j_endFunc = (_footprints: Set<number>) => {
                // Record the footprints of the chosen responses before changing drivers
                this.jake.footprintLog = new Set([..._footprints, ...this.jake.footprintLog]);

                // Determine the next driver for Martina and Jake based on the progress and footprints
                if (this.progress == 0 || this.progress == 1) {
                    this.progress = 1;
                    this.jake.driver = new DialogueDriver(jake_wait_direction, "start", j_endFunc);
                    this.martina.driver = new DialogueDriver(martina_can_give_direction, "start", m_endFunc);
                }
                if (this.progress == 2) {
                    this.jake.driver = new DialogueDriver(give_jake_direction, "start", j_endFunc);
                }
                this.martina.npc!.setNextDialogue(this.martina.driver);

                if (this.progress == 2 && this.jake.footprintLog.has(2) || this.progress == 3) {
                    this.progress = 3;
                    this.jake.driver = new DialogueDriver(jake_has_direction, "start", j_endFunc);
                    // Set Martina to back default convo after Jake has the direction
                    this.martina.npc!.setNextDialogue(undefined);
                }
                this.jake.npc!.setNextDialogue(this.jake.driver!);
            }

            // Set the initial drivers for Martina and Jake
            this.martina.driver = new DialogueDriver(this.martina.npc.config.defaultConvo, "start", m_endFunc);
            this.martina.npc.setNextDialogue(this.martina.driver);
            this.jake.driver = new DialogueDriver(jake_ask_direction, "start", j_endFunc);
            this.jake.npc.setNextDialogue(this.jake.driver);
        }
    }

    /**
     * Adds unique items from newItems to existingItems.
     *
     * @param newItems - Array of items to add.
     * @param existingItems - Array to update with unique items.
     * @returns The updated existingItems array.
     */
    // mergeLists(newItems: Set<number>, existingItems: Set<number>): Set<number> {
    //     newItems.forEach(item => {
    //         if (!existingItems.includes(item))
    //             existingItems.push(item);
    //     });
    //     return existingItems;
    // }
}