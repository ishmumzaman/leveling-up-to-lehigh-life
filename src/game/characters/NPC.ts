// Reviewed on 2024-10-02

import { Inventory } from '../inventory/inventory';
import { Actor, AdvancedCollisionService, AnimatedSprite, AnimationSequence, AnimationState, BoxBody, ChaseMovement, MovementComponent, Obstacle, stage } from "../../jetlag";
import { DialogueDriver } from "../interactions/dialogue";
import { makeSetCharAnimation } from "./character";
import { Spawner } from "../common/spawner";
import { SessionInfo } from "../storage/session";
import { b2BodyType } from '@box2d/core';
import { ConversationMap } from '../interactions/conversation';
import { LevelInfo } from '../storage/level';
import { Extra } from '../../jetlag/Entities/Actor';
import { professor_default } from '../interactions/professorDlg';
import { martina_default } from '../interactions/martinaDlg';
import { alyssa_default } from '../interactions/alyssaDlg';
import { emelia_default } from '../interactions/emeliaDlg';
import { hughyan_default } from '../interactions/hughYanDlg';
import { jake_default } from '../interactions/jakeDlg';
import { main_character_default } from '../interactions/mainCharDialogue';
import { zay_default } from '../interactions/zayDlg';

/** All of the NPCs in the game */
export enum NpcNames {
  Alyssa,
  Emelia,
  HughYan,
  Jake,
  Martina,
  Professor,
  Zay,
  MainCharacter // Not really an NPC, but we need it like this
}

/**
 * Configuration information that is needed any time we work with a certain NPC
 */
export class NpcConfig {
  /** The base name of the image files for the portrait */
  readonly portrait: string;
  /** The default dialogue for this NPC */
  readonly defaultDialogue: DialogueDriver;
  /** The images to use for the NPC animation */
  readonly npcAnimation: {
    animations: Map<AnimationState, AnimationSequence>;
    remap: Map<AnimationState, AnimationState>;
  };

  /**
   * Construct an NpcConfig object with the immutable information describing an
   * NPC.
   *
   * @param name          The display name for the NPC
   * @param spriteName    The base image name for this NPC
   * @param defaultConvo  The default dialogue for this NPC
   */
  constructor(readonly name: string, readonly spriteName: string, readonly defaultConvo: ConversationMap,) {
    this.portrait = spriteName + "PT";
    this.defaultDialogue = new DialogueDriver(defaultConvo, "start");
    this.npcAnimation = makeSetCharAnimation(spriteName);
  }
}

/**
 * Create a directory that maps from NPC names to their configs, so we don't
 * have to re-create them.
 *
 * @returns A map of all the NPCs and their configs
 */
export function makeNpcDirectory() {
  return new Map<NpcNames, NpcConfig>([
    [NpcNames.Alyssa, new NpcConfig("Alyssa", "Alyssa", alyssa_default)],
    [NpcNames.Emelia, new NpcConfig("Emelia", "Emelia", emelia_default)],
    [NpcNames.HughYan, new NpcConfig("Hugh Yan", "HughYan", hughyan_default)],
    [NpcNames.Jake, new NpcConfig("Jake", "Jake", jake_default)],
    [NpcNames.Martina, new NpcConfig("Martina", "Martina", martina_default)],
    [NpcNames.Professor, new NpcConfig("Prof. Parse", "Professor", professor_default)],
    [NpcNames.Zay, new NpcConfig("Zay", "Zay", zay_default)],
    [NpcNames.MainCharacter, new NpcConfig("You", "mainChar", main_character_default)]
  ]);
}

/** 
 * Configuration and behavior information that is needed for any NPC who is
 * drawn in the world.  This version doesn't do anything special with movement,
 * and just triggers a dialogue on any Q interaction.
 *
 * Normally, we just put this into an Actor as its extra, but it's also possible
 * for your code to just keep track of how an NpcDetails object and an Actor
 * relate.
 */
export class NpcBehavior extends Extra {
  /** The configuration information for this NPC */
  config: NpcConfig;

  /** The next dialogue that will run */
  protected nextDialogueDriver: DialogueDriver | undefined;

  /** The actor's inventory */
  readonly inventory: Inventory;

  /** A spawner button, so that the NPC will be interactable */
  public staticSpawner: Spawner;

  /**
   * Construct a normal NPC behavior
   *
   * @param name The NPC type that is being created
   */
  constructor(readonly name: NpcNames) {
    super();
    // Get the NPC config
    let sStore = stage.storage.getSession("sStore") as SessionInfo;
    this.config = sStore.npcs.get(name)!;

    // Give the NPC an inventory as big as the player's to store items
    // [mfs] sStore.inventories should be a map from NpcId to Inventory
    this.inventory = new Inventory(2, 6);
    sStore.inventories.npcs.push(this.inventory);

    // give the NPC a hitbox for interactions 
    this.staticSpawner = new Spawner(3, 6, 0.6, 0.8, "empty.png", () => { this.nextDialogue() });
    this.staticSpawner.sensorOff();
    this.staticSpawner.obstacle.enabled = false;
  }

  /**
   * Proceed to the next dialogue, or use default if there is no next
   */
  public nextDialogue() {
    let lInfo = stage.storage.getLevel("levelInfo") as LevelInfo;
    if (this.nextDialogueDriver) {
      let dlgData = this.nextDialogueDriver;
      this.nextDialogueDriver = undefined; // Reset the next dialogue after using it
      lInfo.hud!.dialogue.newDialogue(this.config, dlgData);
    }
    else {
      lInfo.hud!.dialogue.newDialogue(this.config, this.config.defaultDialogue.clone());
    }
  }

  /**
   * Add a dialogue for the NPC to use when talking to the player next,
   * if undefined, the default dialogue will be used
   * 
   * @param driver  A DialogueDriver of the dialogue
   */
  public setNextDialogue(driver: DialogueDriver | undefined) {
    this.nextDialogueDriver = driver;
  }
}

/**
 * Construct a basic NPC (Obstacle / no movement profile)
 *
 * @param which     The type of NPC to create
 * @param xPos      The NPC's X coordinate
 * @param yPos      The NPC's Y coordinate
 * @param direction The direction to face
 * 
 * @returns An actor, with a NpcBehavior as its extra
 */
export function spawnRegularNpc(which: NpcNames, xPos: number, yPos: number, direction: AnimationState, movement?: MovementComponent) {
  // Create an NpcBehavior and hook it up to an actor
  let details = new NpcBehavior(which);
  let npcAnimation = makeSetCharAnimation(details.config.spriteName);
  let npcActor = new Actor({
    appearance: new AnimatedSprite({ initialDir: direction, width: 0.8, height: 1.6, ...npcAnimation, offset: { dx: 0, dy: -0.6 } }),
    rigidBody: new BoxBody({ cx: xPos, cy: yPos, width: 0.5, height: 0.5 }, { disableRotation: true, collisionsEnabled: true, passThroughId: [1], dynamic: false }),
    role: new Obstacle(),
    movement: movement,
    extra: details,
  });

  // Enable and spawn in the sensor hit box wherever we spawn the NPC
  details.staticSpawner.sensorOn();
  details.staticSpawner.sensor.rigidBody.setCenter(xPos, yPos - 0.3);

  return npcActor;
}

/**
 * Configuration and behavior information for an NPC who also needs to follow
 * another actor.
 *
 * [mfs] This is *very* specialized.  Consider moving to the HawksQuest file?
 */
export class FollowingNpcBehavior extends NpcBehavior {
  /** The actor for this NPC */
  public npcActor?: Actor;

  /** Is the actor currently chasing another actor? */
  public chasing = false;

  /**
   * Construct a FollowingNpcBehavior 
   * 
   * @param name    The NPC type that is being created
   * @param follow  The actor to follow
   */
  constructor(name: NpcNames, public follow: Actor) { super(name); }

  /** Disable this NPC and make it invisible */
  public despawn() {
    this.npcActor!.remove();
    this.staticSpawner.sensorOff(); // Turn off the sensor hitbox
  }

  /**
   * Set the code to run when the NPC is interacted with
   * 
   * @param func the code you want to run when the NPC is interacted with
   */
  public setNPCInteraction(func: any) {
    this.staticSpawner.func = func;
  }

  /** 
   * Follow a target actor 
   * 
   * @param target An optional actor, allowing changing which actor to chase
   */
  public followActor(target?: Actor) {
    this.npcActor!.rigidBody.passThroughId = [3]; // Let the actor pass through the followed
    this.npcActor!.rigidBody.body.SetType(b2BodyType.b2_dynamicBody); // Allows more complex calculations like collisions detection
    this.chasing = true
    // Disable sensors
    this.setNPCInteraction(() => { });
    this.staticSpawner.sensorOff();
    if (target) {
      (this.npcActor!.movement as ChaseMovement).target = target;
      this.follow = target;
    }
    (this.npcActor!.movement as ChaseMovement).enabled = true; // Enable chase movement
  }
}

/**
 * Construct an NPC who can follow another actor
 *
 * [mfs] This is *very* specialized.  Consider moving to the HawksQuest file?
 *
 * @param which     The type of NPC to create
 * @param xPos      The NPC's X coordinate
 * @param yPos      The NPC's Y coordinate
 * @param direction The direction to face
 * @param followed  The actor to follow
 * 
 * @returns An actor, with a NpcBehavior as its extra
 */
export function spawnFollowingNpc(which: NpcNames, xPos: number, yPos: number, direction: AnimationState, followed: Actor) {
  // Create an NpcBehavior and hook it up to an actor
  let details = new FollowingNpcBehavior(which, followed);
  let npcActor = new Actor({
    appearance: new AnimatedSprite({ initialDir: 2, width: 0.8, height: 1.6, animations: details.config.npcAnimation.animations, remap: details.config.npcAnimation.remap, offset: { dx: 0, dy: -0.6 } }),
    rigidBody: new BoxBody({ cx: xPos, cy: yPos, width: 0.5, height: 0.5 }, { disableRotation: true, collisionsEnabled: true, passThroughId: [1], dynamic: false }),
    movement: new ChaseMovement({ speed: 4.9, target: details.follow!, multiplier: 5 }),
    role: new Obstacle(),
    extra: details,
  });
  details.npcActor = npcActor;
  // Initially, chase is enabled.  We want to disable it at first
  (npcActor.movement as ChaseMovement).enabled = false;

  // Create collision contact system to create NPC follow train
  (stage.world.physics as AdvancedCollisionService).addBeginContactHandler(npcActor, details.follow!, () => {
    if (details.chasing) {                                             // If the npc is currently chasing
      (npcActor.movement as ChaseMovement).enabled = false;  // turn off their chasing movement when they collide
      // Track when they stop colliding and enable their chasing when they do
      (stage.world.physics as AdvancedCollisionService).addEndContactHandler(npcActor, details.follow!, () => {
        (npcActor.movement as ChaseMovement).enabled = true;
      });
    }
  });

  // Get rid of the NPC's initial appearance to change direction and 
  // give them a new appearance with correct animation and direction
  npcActor.appearance.pop();
  let npcAnimation = makeSetCharAnimation(details.config.spriteName);
  let newAppearance = new AnimatedSprite({ initialDir: direction, width: 0.8, height: 1.6, animations: npcAnimation.animations, remap: npcAnimation.remap, offset: { dx: 0, dy: -0.6 } })
  npcActor.appearance.push(newAppearance);
  newAppearance.actor = npcActor; // You need to link the actor with its appearance ALWAYS or else it doesn't work.

  // Enable and spawn in the sensor hit box wherever we spawn the NPC
  details.staticSpawner.sensorOn();
  details.staticSpawner.sensor.rigidBody.setCenter(xPos, yPos - 0.3);

  return npcActor;
}

