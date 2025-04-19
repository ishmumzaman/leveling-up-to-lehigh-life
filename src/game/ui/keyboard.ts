// Reviewed on 2024-09-25

import { Actor, KeyCodes, ManualMovement, stage, TimedEvent } from "../../jetlag";
import { LevelInfo } from "../storage/level";
import { SessionInfo } from "../storage/session";

/**
 * KeyboardHandler registers code to run on W/A/S/D key events, and uses them to
 * control the movement of an actor.  It also registers E/Q key event handlers.
 */
export class KeyboardHandler {
  /// A TimedEvent that detects keyboard events and uses them to control the
  /// Player.
  private playerControls?: TimedEvent;

  /** Code to run when "Q" is pressed */
  currInteraction: () => void = () => { };

  /**
   * Construct a KeyboardHandler handler
   *
   * @param actor The actor to control
   */
  constructor(private actor: Actor) {
    this.playerControls = this.keyHandler(this.actor);
  }

  /**
   * Enable smooth movement control for the Player, by using a timer to poll for
   * keyboard state changes and update velocity accordingly.  This ensures that
   * diagonal movement has the same velocity as movement in a cardinal
   * direction.
   *
   * [mfs]  I don't like it that we might make this, then kill the event, then
   *        make it again.  I think it would be better if we could just
   *        "temporarily suspend" the key handlers.  But that might not work
   *        with user input dialog boxes.  Need to look into it.
   *
   * @param hero the player's character to control
   *
   * @returns The event used to continuously check for the player's movement
   */
  private keyHandler(hero: Actor) {
    let lInfo = stage.storage.getLevel("levelInfo") as LevelInfo;
    // Set up some keyboard listeners so that we always know which keys are down
    // and which are up:
    let keyW: boolean;
    let keyA: boolean;
    let keyS: boolean;
    let keyD: boolean;
    stage.keyboard.setKeyUpHandler(KeyCodes.KEY_W, () => { keyW = false; });
    stage.keyboard.setKeyUpHandler(KeyCodes.KEY_S, () => { keyS = false; });
    stage.keyboard.setKeyUpHandler(KeyCodes.KEY_A, () => { keyA = false; });
    stage.keyboard.setKeyUpHandler(KeyCodes.KEY_D, () => { keyD = false; });
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_W, () => { keyW = true; });
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_S, () => { keyS = true; });
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_A, () => { keyA = true; });
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_D, () => { keyD = true; });

    // Set up a timer event to adjust velocity based on keyboard state
    //
    // [mfs]  Could we use stage.world.repeatEvents instead of the tiny timer
    //        interval on stage.world.timer?      // .01 seconds but rather every frame due to how jetlag works
    let event = new TimedEvent(0.01, true, () => { this.heroVelocityFixer(keyW, keyA, keyS, keyD, hero); });
    stage.world.timer.addEvent(event);

    // Set inventory and interaction keys
    //
    // [mfs]  It looks like stopPlayerControls doesn't have any effect on these.
    //        Is that OK?
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_E, () => { lInfo.hud!.toggleMode("inventory"); });
    stage.keyboard.setKeyDownHandler(KeyCodes.KEY_Q, () => { this.currInteraction(); });

    // [mfs]  I *really* want an escape key for dismissing a completed dialog, and
    //        a space key for rapidly finishing the dialog text.

    return event;
  }

  /**
   * Starts the player controls.
   *
   * [mfs]  It looks like they start in the "on" state, via the call to
   *        keyHandler in spawnPlayer.  Maybe all we really need is a way to
   *        *toggle* the controls, instead of removing timer events?  Could we
   *        do that by capturing a bool, and using it to make heroVelocityFixer
   *        exit early?
   */
  public startPlayerControls() {
    if (this.actor) { this.playerControls = this.keyHandler(this.actor); }
  }

  /**
   * Stops the player controls.
   */
  public stopPlayerControls() {
    if (this.actor && this.playerControls) {
      stage.world.timer.removeEvent(this.playerControls);
      this.playerControls = undefined;
      (this.actor.movement as ManualMovement).updateXVelocity(0);
      (this.actor.movement as ManualMovement).updateYVelocity(0);
    }

    let lInfo = stage.storage.getLevel("levelInfo") as LevelInfo;
    if (lInfo.hud!.getMode() != 'inventory') stage.keyboard.setKeyDownHandler(KeyCodes.KEY_E, () => { });
    if (lInfo.hud!.getMode() == 'inventory' || lInfo.hud!.getMode() == 'dialogue')
      stage.keyboard.setKeyDownHandler(KeyCodes.KEY_Q, () => { });
  }
  /**
   * Handle all movement quirks when they happen while normalizing diagonal movement
   *
   * @param keyW the status of the W key - true if held down - false otherwise
   * @param keyA the status of the A key
   * @param keyS the status of the S key
   * @param keyD the status of the D key
   * @param hero the hero to modify the movement of. Typically the main character
   *      // .01 seconds but rather every frame due to how jetlag works
   * @returns Nothing. Simply skip some checks if moving diagonally
   */
  private heroVelocityFixer(keyW: boolean, keyA: boolean, keyS: boolean, keyD: boolean, hero: Actor) {
    let sStore = stage.storage.getSession("sStore") as SessionInfo;
    let vX = 0; let vY = 0;

    // Step 1:  If the hero collided with a diagonal wall, it might have an
    //          unintentional velocity.  If the corresponding key is not pressed,
    //          disable that velocity.
    let m = hero.movement as ManualMovement;
    if (m.getYVelocity()! < 0 && keyW === false) vY = 0;
    if (m.getYVelocity()! > 0 && keyS === false) vY = 0;
    if (m.getXVelocity()! < 0 && keyA === false) vX = 0;
    if (m.getXVelocity()! > 0 && keyD === false) vX = 0;

    // Step 2:  If two complementary keys are being pressed (e.g., left and down),
    //          then normalize the velocity so that diagonal movement is not
    //          faster than forward movement.
    if (keyW && keyA) {
      vY = -3.8;
      vX = -3.8;
    }
    else if (keyW && keyD) {
      vY = -3.8;
      vX = 3.8;
    }
    else if (keyS && keyA) {
      vY = 3.8;
      vX = -3.8;
    }
    else if (keyS && keyD) {
      vY = 3.8;
      vX = 3.8;
    }
    // Step 3:  Otherwise, go forward in a single direction.  Note that if
    //          antagonistic keys are pressed (like up and down), this hard-codes
    //          a winner through the order of the conditions.  Up and Right win.
    else if (keyW) {
      vY = -5;
    }
    else if (keyS) {
      vY = 5;
    }
    else if (keyA) {
      vX = -5;
    }
    else if (keyD) {
      vX = 5;
    }

    // Update `hero`'s X velocity to `v`
    let velX = sStore.playerStat.energy > 30 ? vX : vX * 0.7;
    (hero.movement as ManualMovement).updateXVelocity(velX);


    // Update `hero`'s Y velocity to `v`
    let velY = sStore.playerStat.energy > 30 ? vY : vY * 0.7;
    (hero.movement as ManualMovement).updateYVelocity(velY);
  }
}