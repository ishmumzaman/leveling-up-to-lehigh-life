// Reviewed on 2024-09-25

import { Actor, AnimatedSprite, AnimationSequence, AnimationState, BoxBody, Hero, ManualMovement, stage, TimedEvent } from "../../jetlag";
import { movementPacket, outfitChangePacket } from "../multiplayer/loginSystem";
import { SessionInfo } from "../storage/session";
import { CharacterAnimations } from "./characterCustomization";
import { defaultCharacter } from "./makeCharacterBuilder";

/**
 * Create character animations for an NPC character.
 *
 * NB:  These animations were primarily taken from the interiors asset pack
 *
 * @param characterSprite The file name of the character - do not include their
 *                        stage (Eg. WalkW0) or the file extension (eg. .png)
 *
 * @returns A Map of animations and a Map for the animation remappings
 */
export function makeSetCharAnimation(characterSprite: string) {
  // Create WALK and IDLE animations in the 4 cardinal directions
  let animations = new Map<AnimationState, AnimationSequence>();
  animations.set(AnimationState.WALK_W, new AnimationSequence(true).to(characterSprite + "WalkW0.png", 135).to(characterSprite + "WalkW1.png", 135).to(characterSprite + "WalkW2.png", 135).to(characterSprite + "WalkW3.png", 135).to(characterSprite + "WalkW4.png", 135).to(characterSprite + "WalkW5.png", 135));
  animations.set(AnimationState.WALK_E, new AnimationSequence(true).to(characterSprite + "WalkE0.png", 135).to(characterSprite + "WalkE1.png", 135).to(characterSprite + "WalkE2.png", 135).to(characterSprite + "WalkE3.png", 135).to(characterSprite + "WalkE4.png", 135).to(characterSprite + "WalkE5.png", 135));
  animations.set(AnimationState.WALK_S, new AnimationSequence(true).to(characterSprite + "WalkS0.png", 135).to(characterSprite + "WalkS1.png", 135).to(characterSprite + "WalkS2.png", 135).to(characterSprite + "WalkS3.png", 135).to(characterSprite + "WalkS4.png", 135).to(characterSprite + "WalkS5.png", 135));
  animations.set(AnimationState.WALK_N, new AnimationSequence(true).to(characterSprite + "WalkN0.png", 135).to(characterSprite + "WalkN1.png", 135).to(characterSprite + "WalkN2.png", 135).to(characterSprite + "WalkN3.png", 135).to(characterSprite + "WalkN4.png", 135).to(characterSprite + "WalkN5.png", 135));
  animations.set(AnimationState.IDLE_W, new AnimationSequence(true).to(characterSprite + "IdleW0.png", 180).to(characterSprite + "IdleW1.png", 180).to(characterSprite + "IdleW2.png", 180).to(characterSprite + "IdleW3.png", 180).to(characterSprite + "IdleW4.png", 180).to(characterSprite + "IdleW5.png", 180));
  animations.set(AnimationState.IDLE_E, new AnimationSequence(true).to(characterSprite + "IdleE0.png", 180).to(characterSprite + "IdleE1.png", 180).to(characterSprite + "IdleE2.png", 180).to(characterSprite + "IdleE3.png", 180).to(characterSprite + "IdleE4.png", 180).to(characterSprite + "IdleE5.png", 180));
  animations.set(AnimationState.IDLE_S, new AnimationSequence(true).to(characterSprite + "IdleS0.png", 180).to(characterSprite + "IdleS1.png", 180).to(characterSprite + "IdleS2.png", 180).to(characterSprite + "IdleS3.png", 180).to(characterSprite + "IdleS4.png", 180).to(characterSprite + "IdleS5.png", 180));
  animations.set(AnimationState.IDLE_N, new AnimationSequence(true).to(characterSprite + "IdleN0.png", 180).to(characterSprite + "IdleN1.png", 180).to(characterSprite + "IdleN2.png", 180).to(characterSprite + "IdleN3.png", 180).to(characterSprite + "IdleN4.png", 180).to(characterSprite + "IdleN5.png", 180));

  // Remap the non-cardinal directions
  let remap = new Map<AnimationState, AnimationState>();
  remap.set(AnimationState.WALK_NW, AnimationState.WALK_W);
  remap.set(AnimationState.WALK_SW, AnimationState.WALK_W);
  remap.set(AnimationState.WALK_NE, AnimationState.WALK_E);
  remap.set(AnimationState.WALK_SE, AnimationState.WALK_E);
  remap.set(AnimationState.IDLE_NW, AnimationState.IDLE_W);
  remap.set(AnimationState.IDLE_SW, AnimationState.IDLE_W);
  remap.set(AnimationState.IDLE_NE, AnimationState.IDLE_E);
  remap.set(AnimationState.IDLE_SE, AnimationState.IDLE_E);

  return { animations, remap };
}

/**
 * Create a linear or cyclic animation from some PNG files
 *
 * @param imgName   the name of the image - do not include a number - do not
 *                  include file extension
 * @param numFrame  the number of frames the animation has (typically the number
 *                  of images it has)
 * @param timePerFrame    the time to spend on each animation frame in milliseconds
 * @param repeat         if the animation should repeat
 * @param isCyclic  Should the animation jump back to 1, or work its way back
 *                  down?
 * @returns A map where IDLE_E is associated with the appropriate sequence
 */
export function makeSimpleAnimation(imgName: string, numFrame: number, timePerFrame: number, repeat: boolean, isCyclic: boolean): Map<AnimationState, AnimationSequence> {
  // Generates image names based on the number of frames and image name
  let images: string[] = [];
  for (let i = 0; i < numFrame; i++)
    images.push(imgName + i + ".png");

  // Repeat some names in reverse if it's cyclic
  if (isCyclic) {
    for (let i = numFrame - 2; i > 0; i--)
      images.push(imgName + i + ".png");
  }

  // Create the actual animation sequence using our parameters, and set it as
  // the default animation (IDLE_E)
  let animation = AnimationSequence.makeSimple({ timePerFrame, repeat, images });
  return new Map([[AnimationState.IDLE_E, animation]]);
}

/**
 * Create an animation based on the particular emotion needed for dialogue
 * portraits
 *
 * @param portrait  the name of the portrait, usually ends with "PT" - NO STATE
 *                  OR FILE EXTENSION
 * @param emote the emoticon to show
 *
 * @returns A map where IDLE_E is associated with the appropriate sequence
 */
export function makeEmoteAnimation(portrait: string, emote: string): Map<AnimationState, AnimationSequence> {
  return makeSimpleAnimation(portrait + emote, 10, 100, true, false);
}

/**
 * Create an actor with the desired player customization, suitable for use as
 * the main character
 *
 * [mfs]  This should stop deferring to session.locX/session.locY.  The caller
 *        should do that, so this can be simpler.  Then maybe we could use it to
 *        spawn NPCs, too.
 *
 * @param cx          The spawn X point (always defers to session.locX)
 * @param cy          The spawy Y point (always defers to session.locY)
 * @param initialDir  The direction that the animation should face
 *
 * @returns The actor that was created
 */
export function makeMainCharacter(cx: number, cy: number, animation: CharacterAnimations = new CharacterAnimations(defaultCharacter), initialDir: AnimationState = AnimationState.IDLE_E) {
  let sStore = stage.storage.getSession("sStore") as SessionInfo;
  // Make the actor
  //
  // NB: Always prioritize the player's spawn point from the session storage
  let cX = sStore.locX ?? cx;
  let cY = sStore.locY ?? cy;
  let actor = new Actor({
    appearance: [new AnimatedSprite({ initialDir, width: 0.8, height: 1.6, ...animation, offset: { dx: 0, dy: -0.6 }, z: 2 })],
    rigidBody: new BoxBody({ cx: cX, cy: cY, width: 0.5, height: 0.5 }, { disableRotation: true, passThroughId: [3] }),
    movement: new ManualMovement(),
    role: new Hero(),
  });

  // sets up multiplayer outfit and move packets
  if (sStore.mutliplayerMode === true) {
    // TODO: change to use server responses
    stage.world.timer.addEvent(new TimedEvent(.1, false, () => { // Waits for server
      stage.network.doOutfitChange(JSON.stringify(new outfitChangePacket(sStore.loginInfo.userId, sStore.playerAppearance?.config || defaultCharacter)))

      stage.world.repeatEvents.push(() => { // Occurs every frame until stage change
        if (sStore.loginInfo && actor) {
          stage.network.doMove(JSON.stringify(new movementPacket(sStore.loginInfo.userId, actor.rigidBody.getCenter().x, actor.rigidBody.getCenter().y, actor.rigidBody.getVelocity().x, actor.rigidBody.getVelocity().y)));
        }
      });
    }))
  }

  sStore.loginInfo.myActor = actor; // Might not be needed check if anythign uses it
  return actor;
}
