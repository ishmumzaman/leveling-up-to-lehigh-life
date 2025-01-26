// Reviewed on 2024-09-29

import { AnimatedSprite, Obstacle } from "../../jetlag";
import { Actor, AdvancedCollisionService, BoxBody, FilledBox, ImageSprite, Sensor, stage } from "../../jetlag";
import { makeSimpleAnimation } from "../characters/character";
import { LevelInfo } from "../storage/level";

/** An blank actor with no appearance or rigid body */
export function blankActor() {
  return new Actor({
    appearance: new FilledBox({ width: 0, height: 0, fillColor: "#00FFFFFF" }),
    rigidBody: new BoxBody({ cx: 0.1, cy: 0.1, width: 0, height: 0 }, { disableRotation: true, collisionsEnabled: false }),
  });
}

/**
 * Spawnables are objects that can be interacted with via the Q key.  In more
 * detail, when the hero is "close to" a spawner, it will set up an animation
 * and set a function to run in response to the Q key.  When the hero moves
 * away, those things get undone.
 *
 * [mfs]  This should probably be renamed.
 *
 * [mfs]  Right now, spawners always use "empty.png".  We should consider
 *        getting rid of the `img` argument to the constructor.
 *
 * [mfs]  In the past, there was AnimatedSpawner, which differed only in that it
 *        had more constructor arguments, which let it build an animated thing.
 *        If we want anything other than "empty.png", consider making the
 *        constructor take an Appearance component, and then the caller can do
 *        all the configuration.
 */
export class Spawner {

  /**
   * Spawners always start with an obstacle that the hero can't walk through.
   *
   * [mfs] I'm not convinced that we need this.  Perhaps we could just use the
   * sensor?
   */
  readonly obstacle: Actor;

  /**
   * The spawner's sensor is the thing that detects that the hero is "close".
   */
  readonly sensor: Actor;

  /**
   * Construct a spawnable that is used for 'Q' interations with the hero
   *
   * @param cx    center x coordinate of the spawnable
   * @param cy    center y coordinate of the spawnable
   * @param w     width of the spawnable
   * @param h     height of the spawnable
   * @param img   image file for the spawnable
   * @param func  The function to be called when interacted with.  Must be
   *              editable.
   */
  constructor(private cx: number, private cy: number, private w: number, private h: number, private img: string, public func: () => void = () => { }) {
    let lInfo = stage.storage.getLevel("levelInfo") as LevelInfo;

    // Create the obstacle
    this.obstacle = new Actor({
      appearance: new ImageSprite({ width: this.w, height: this.h, img: this.img }),
      // [mfs]  Why passThroughId[2]?  Nothing else has this ID, so it seems not
      //        useful?
      rigidBody: new BoxBody({ cx: this.cx, cy: this.cy, width: this.w, height: this.h }, { passThroughId: [2], collisionsEnabled: true }),
      role: new Obstacle(),
    });

    // Overlay a sensor on it.  The sensor will be a bit bigger than the
    // obstacle.
    this.sensor = new Actor({
      appearance: [new FilledBox({ width: 0, height: 0, fillColor: "#00FFFFFF" })],
      rigidBody: new BoxBody({ cx: this.cx, cy: this.cy, width: this.w + 0.7, height: this.h + 0.7 }),
      role: new Sensor({
        heroCollision: () => {
          // Create a flashing indicator that spawnable is interactable, put it
          // on the sensor.
          let indicator = new AnimatedSprite({ width: 0.6, height: 0.6, animations: makeSimpleAnimation("indicator", 6, 100, true, false), offset: { dx: 0, dy: 0 } });
          this.sensor.appearance.push(indicator);
          indicator.actor = this.sensor;

          // Create a 'Q' interaction prompt and add it to the hero's appearance
          let prompt = new AnimatedSprite({ width: 0.4, height: 0.4, animations: makeSimpleAnimation("qKeys", 3, 300, true, false), z: 2, offset: { dx: 0, dy: -1.3 } });
          lInfo.mainCharacter!.appearance.push(prompt);
          prompt.actor = lInfo.mainCharacter;

          // Set the code to run on "Q"
          lInfo.keyboard!.currInteraction = this.func;

          // Remove the prompt and indicator when the hero moves away
          (stage.world.physics as AdvancedCollisionService).addEndContactHandler(this.sensor!, lInfo.mainCharacter!, () => {
            lInfo.keyboard!.currInteraction = () => { };
            // Remove the interaction prompt and indicator
            if (lInfo.mainCharacter && lInfo.mainCharacter.appearance.length > 1) {
              lInfo.mainCharacter.appearance.pop();
              this.sensor!.appearance.pop();
            }
          });
        }
      })
    });
  }

  /** Enable the sensor actor if it exists */
  public sensorOn() { this.sensor.enabled = true; }

  /**
   * Disable the sensor actor if it exists.
   * Remove the interaction prompt from the hero's appearance.
   */
  public sensorOff() {
    let lInfo = stage.storage.getLevel("levelInfo") as LevelInfo;
    // [mfs]  This is brittle... are we sure the character will always have a Q
    //        on it?  Are we sure the character will never have >1 base
    //        appearance?
    if (lInfo.mainCharacter) {
      this.sensor.enabled = false;
      if (lInfo.mainCharacter.appearance.length > 1) lInfo.mainCharacter.appearance.pop();
    }
  }
}