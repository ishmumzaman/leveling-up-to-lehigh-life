// Reviewed on 2024-09-27

import { Quest } from '../quests/questLogic';
import { Inventory } from "../inventory/inventory";
import { CharacterAnimations } from '../characters/characterCustomization';
import { PrepareInspectables } from "../interactions/inspectables"
import { makeNpcDirectory } from '../characters/NPC';
import { HawksQuest } from '../quests/hawksQuest';
import { RemoteActor } from '../multiplayer/loginSystem';
import { Actor } from '../../jetlag';
import { defaultCharacter } from '../characters/makeCharacterBuilder';

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
  loginInfo = { userId: "", userName: "", connected: false, room: {builder: "", id: ""}, remoteActors: new Map<string, RemoteActor>(), myActor: undefined as (Actor | undefined) }
  nextLevel = {nextBuilder: "", playerLimit: 0};
  multiplayerMode = false;

  /**
   * Inventory data for the player, NPCs, and shelves
   * 
   * [mfs] This needs to be split out a bit, but it's OK for now.
   */
  inventories = {
    player: new Inventory(2, 6),
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
  locX?: number;
  locY?: number;

  /**
   * Player statistics
   * 
   * [mfs] These aren't fully in use yet, but they're good to have
   */
  playerStat = {
    charName: "Me",
    wellness: 100,
    fitness: 100,
    energy: 100
  };

  /** Quest data */
  currQuest?: Quest = new HawksQuest();

  /**
   * Information from the character customization screen, which we can use to
   * draw the main character's animations.
   */
  playerAppearance: CharacterAnimations = new CharacterAnimations(defaultCharacter.clone());;

  /** A lookup table for finding the right dialog for each inspectable */
  readonly inspectables = PrepareInspectables();

  /** A catalog of all of the NPCs in the game */
  readonly npcs = makeNpcDirectory();
}