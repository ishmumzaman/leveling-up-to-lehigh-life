/**
 * Quest Dialogue Helpers
 * ----------------------
 * This module provides utility functions to attach or retrieve quest-sensitive dialogue logic.
 * It supports dynamic switching of NPC dialogues based on quest status, such as:
 *
 * - Offering a quest if none is active and the current quest is not started
 * - Showing a fallback/busy message if another quest is already active
 * - Showing default dialogue if the quest is already active or completed
 */

import { DialogueDriver } from "../interactions/dialogue";
import { ConversationMap } from "../interactions/conversation";
import { QuestNames } from "./questNames";
import { Quest } from "./questLogic";
import { QuestStorage } from "../storage/questStorage";
import { SessionInfo } from "../storage/session";
import { LevelInfo } from "../storage/level";
import { stage } from "../../jetlag/Stage";
import { Places } from "../places/places";
import { Actor } from "../../jetlag";
import { NpcBehavior } from "../characters/NPC";

/**
 * Choose a dialogue path depending on the status of a given quest.
 *
 * @param options Configuration options:
 * - `questName`: The unique ID of the quest.
 * - `dialogues`: An object containing `prestart`, `default`, and `busy` ConversationMaps.
 * - `prestartKey`: The key to start the pre-quest dialogue.
 * - `onAccept`: Optional callback if the user accepts the quest.
 * - `acceptFootprint`: The footprint number that triggers the `onAccept` callback (default is 99).
 *
 * @returns A DialogueDriver instance appropriate to the quest's current state.
 */
export function chooseQuestDialogueDriver(options: {
  questName: QuestNames,
  dialogues: {
    prestart: ConversationMap,
    default: ConversationMap,
    busy: ConversationMap,
  },
  prestartKey: string,
  onAccept?: () => void,
  acceptFootprint?: number,
}): DialogueDriver {
  const status = QuestStorage.getStatus(options.questName);
  const activeQuest = QuestStorage.getActiveQuest();
  const acceptKey = options.acceptFootprint ?? 99;

  if ((status === "Not Active" || status === "Paused") && activeQuest === undefined) {
    return new DialogueDriver(options.dialogues.prestart, options.prestartKey, (footprints) => {
      if (footprints.has(acceptKey) && options.onAccept) {
        options.onAccept();
      }
    });
  }

  if (activeQuest && activeQuest !== options.questName) {
    return new DialogueDriver(options.dialogues.busy, "start");
  }

  return new DialogueDriver(options.dialogues.default, "start");
}

/**
 * Quickly wires up an NPC to start a quest using dialogue.
 *
 * @param options Configuration options:
 * - `npc`: The character to attach the logic to.
 * - `quest`: The Quest instance.
 * - `prestartDialogue`: The dialogue shown before quest starts.
 * - `busyDialogue`: Dialogue if another quest is active.
 * - `defaultDialogue`: Dialogue shown once the quest is active.
 * - `level`: The LevelInfo (used for onMakeNpc/onMakeBuilder).
 * - `levelNumber`: The level's ID/number.
 * - `place`: The Place enum value the NPC is in.
 * - `acceptFootprint`: (optional) the footprint that triggers quest start.
 * - `setAsCurrent`: (optional) if true, sets `sStore.currQuest = quest`
 */
export function makeQuestStartingNpc(options: {
  npc: Actor,
  quest: Quest,
  prestartDialogue: ConversationMap,
  busyDialogue: ConversationMap,
  defaultDialogue: ConversationMap,
  level: LevelInfo,
  levelNumber: number,
  place: Places,
  acceptFootprint?: number,
  setAsCurrent?: boolean,
}) {
  const questName = options.quest.questName as QuestNames;

  (options.npc.extra as NpcBehavior).onInteract = () => {
    const driver = chooseQuestDialogueDriver({
      questName,
      dialogues: {
        prestart: options.prestartDialogue,
        busy: options.busyDialogue,
        default: options.defaultDialogue
      },
      prestartKey: "start",
      acceptFootprint: options.acceptFootprint ?? 1,
      onAccept: () => {
        if (options.setAsCurrent) {
          const s = stage.storage.getSession("sStore") as SessionInfo;
          s.currQuest = options.quest;
          options.quest.start();
        }

        options.quest.onMakeNpc(options.place, options.levelNumber, options.npc);
        options.quest.onBuildPlace(options.place, options.levelNumber);
      }
    });

    (options.npc.extra as NpcBehavior).setNextDialogue(driver);
    (options.npc.extra as NpcBehavior).nextDialogue();
  };
}