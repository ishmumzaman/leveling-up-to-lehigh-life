import { ItemType } from './../inventory/item';
// Reviewed on 2024-09-27

import { Quest } from '../quests/questLogic';
import { QuestStatus, QuestProgress } from "./questStorage";
import { QuestNames } from "../quests/questNames";
import { Inventory } from "../inventory/inventory";
import { CharacterAnimations } from '../characters/characterCustomization';
import { PrepareInspectables } from "../interactions/inspectables"
import { makeNpcDirectory } from '../characters/NPC';
import { HawksQuest } from '../quests/hawksQuest';
import { RemoteActor } from '../multiplayer/loginSystem';
import { Actor, AnimationState } from '../../jetlag';
import { defaultCharacter } from '../characters/makeCharacterBuilder';
import { WorldClock } from '../common/clock';
import { Stats } from '../characters/stats';


/**
 * SessionInfo is the object we keep in the Session storage.  It provides a way
 * for us to save information while moving across calls to different builders.
 *
 * Note: In any code that needs session storage, use a line like this:
 *       `let session_info = stage.storage.getSession("sStore") as SessionInfo`
 */
export class SessionInfo {
  /**
   * Login data for multiplayer
   */
  loginInfo = { userId: "", userName: "", connected: false, room: { builder: "", id: "" }, remoteActors: new Map<string, RemoteActor>(), myActor: undefined as (Actor | undefined) }
  nextLevel = { nextBuilder: "", playerLimit: 0 };
  multiplayerMode = false;

  /**
   * Inventory data for the player, NPCs, and shelves
   *
   * [mfs] This needs to be split out a bit, but it's OK for now.
   */
  inventories = {
    player: { main: new Inventory(2, 6), outfit: new Inventory(1, 1, ItemType.Outfit), accessory: new Inventory(1, 1, ItemType.Accessory) },
    npcs: [] as Inventory[], // This should be in the quest object
    shelves: [] as Inventory[], // This should be in the quest object
  };

  // Location data for player spawning
  //
  // TODO: Switch to a new system for player spawning
  //
  // [mfs]  I think it would suffice to have a way of knowing which builder and
  //        which level the player is coming from, then the builder can decide
  //        for itself.
  goToX?: number;
  goToY?: number;
  dir = AnimationState.IDLE_S

  /**
   * Player statistics
   *
   * [mfs] These aren't fully in use yet, but they're good to have
   */
  playerStat = new Stats(100);

  /** Quest data */
  currQuest?: Quest = undefined;

  /** Quest state tracking fields */
  questStatus: { [questName in QuestNames]?: QuestStatus } = {};
  pausedQuests: { [questName in QuestNames]?: QuestProgress } = {};

  /**
   * Information from the character customization screen, which we can use to
   * draw the main character's animations.
   */
  playerAppearance: CharacterAnimations = new CharacterAnimations(defaultCharacter.clone());;

  /** A lookup table for finding the right dialog for each inspectable */
  readonly inspectables = PrepareInspectables();

  /** A catalog of all of the NPCs in the game */
  readonly npcs = makeNpcDirectory();

  /** World Clock */
  clock = new WorldClock();

  /** Funtion that runs when an in-game minute (a second in real time if minute rate = 1) passes */
  onMinute() {
    // Every in-game minute, hunger drops. If hunger drops below a certain point, energy starts dropping.
    // The lower the hunger the faster the energy drops.
    if (this.playerStat.hunger > 1) this.playerStat.hunger -= 0.2;
    if (this.playerStat.energy > 1 && this.playerStat.hunger < 80) this.playerStat.energy -= 0.005 * (100 - this.playerStat.hunger);
  }
}