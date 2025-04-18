// Reviewed on 2024-10-02

import { Actor, AnimatedSprite, BoxBody, FilledBox, ImageSprite, SpriteLocation, stage, TextSprite, TimedEvent } from "../../jetlag";
import { NpcConfig } from "../characters/NPC";
import { FadingBlurFilter } from "../common/filter";
import { textSlicer } from '../common/textFormatting';
import { makeEmoteAnimation } from "../characters/character";
import { LevelInfo } from "../storage/level";
import { DialogueDriver } from "../interactions/dialogue";

export class DialogueUI {
  /** Track if the UI is showing */
  private showing = false;

  /** The main box that forms the background of the UI */
  private dialogueBox: Actor;

  /** The animated text component */
  private textActor: Actor;

  /** The text to show (changes over time to give an animated effect) */
  private textAppearance = "";

  /** For blurring the background when the UI is showing */
  private fadeFilter: FadingBlurFilter;

  /**
   * A receiver for when there are no responses, but a click is needed in order to
   * advance
   */
  private clickToContinue: Actor;

  /** Track if the response box is showing */
  private responseState = false;

  /** The main box that forms the background of the response box */
  private responseBox: Actor;

  /** The responses that can be chosen */
  private responseBoxes: Actor[] = [];

  /** The text for each response box */
  private readonly responseTexts = ["", "", ""];

  /** The NPC whose appearance will be drawn */
  private npc?: NpcConfig;

  /** The driver for advancing the conversation */
  private driver?: DialogueDriver;

  /**
   * Construct the DialogueUI
   *
   * [mfs] We don't enforce that this is a singleton, even though it is.
   */
  constructor() {
    // Create dialogue menus
    this.dialogueBox = new Actor({
      appearance: [
        new ImageSprite({ width: 15, height: 2.5, img: "dialogueBox.png", z: 2 }), // background box
        new ImageSprite({ width: 2, height: 2, img: "portraitBox.png", offset: { dx: -6, dy: 0 }, z: 2 }), // Portrait box
        new ImageSprite({ width: 4.5, height: .8, img: "characterName.png", offset: { dx: -5, dy: -1.5 }, z: 2 }), // Character name box
        // Two placeholders for the NPC name and the NPC emote animation
        new FilledBox({ width: 1, height: 1, fillColor: "#00000000" }),
        new FilledBox({ width: 1, height: 1, fillColor: "#00000000" }),
      ],
      rigidBody: new BoxBody({ cx: 8, cy: 7.5, width: 0, height: 0 }, { scene: stage.hud }), // No rigid body is required so we shall remove it through 0 width and height
    });

    // Put the text on top of it
    this.textActor = new Actor({
      rigidBody: new BoxBody({ cx: 3.25, cy: 6.75, width: 0, height: 0 }, { scene: stage.hud }),
      appearance: new TextSprite({ center: false, face: stage.config.textFont, color: "#FFFFFF", size: 22, z: 2 }, () => this.textAppearance)
    })

    // create response menus
    this.responseBox = new Actor({ // The response box brown background
      appearance: [new ImageSprite({ width: 7, height: 2.5, img: "choiceBox.png", z: 2 })],
      rigidBody: new BoxBody({ cx: 11, cy: 4.75, width: 0, height: 0 }, { scene: stage.hud }),
    });

    this.clickToContinue = new Actor({ // The invisible body that pops up when playerResponse is false and the responses available are 1 or 0. Allows the player to click where ever to advance dialogue.
      appearance: [new ImageSprite({ width: .25, height: .5, img: "dialogueArrow.png", z: 2, offset: { dx: 6.75, dy: .95 } })],
      rigidBody: new BoxBody({ cx: 8, cy: 7.3, width: 15, height: 3 }, { scene: stage.hud }),
      gestures: { tap: () => { this.next(); this.closeResponses(); return true; } },
    });

    this.responseBoxes.push(new Actor({
      appearance: [new ImageSprite({ width: 6.5, height: .6, img: "optionChoice.png", z: 2 }), new TextSprite({ center: true, face: stage.config.textFont, color: "#FFFFFF", size: 14, z: 2 }, () => this.responseTexts[0])],
      rigidBody: new BoxBody({ cx: 11, cy: 4.1, width: 6.5, height: .6 }, { scene: stage.hud }),
      gestures: { tap: () => { this.next(0); this.closeResponses(); return true; } },
    }));

    this.responseBoxes.push(new Actor({
      appearance: [new ImageSprite({ width: 6.5, height: .6, img: "optionChoice.png", z: 2 }), new TextSprite({ center: true, face: stage.config.textFont, color: "#FFFFFF", size: 14, z: 2 }, () => this.responseTexts[1])],
      rigidBody: new BoxBody({ cx: 11, cy: 4.85, width: 6.5, height: .6 }, { scene: stage.hud }),
      gestures: { tap: () => { this.next(1); this.closeResponses(); return true; } },
    }));

    this.responseBoxes.push(new Actor({
      appearance: [new ImageSprite({ width: 6.5, height: .6, img: "optionChoice.png", z: 2 }), new TextSprite({ center: true, face: stage.config.textFont, color: "#FFFFFF", size: 14, z: 2 }, () => this.responseTexts[2])],
      rigidBody: new BoxBody({ cx: 11, cy: 5.6, width: 4.8, height: .6 }, { scene: stage.hud }),
      gestures: { tap: () => { this.next(2); this.closeResponses(); return true; } },
    }));

    // Initialize the blur filter to be used later
    this.fadeFilter = new FadingBlurFilter(0, 5, false);
    stage.renderer.addFilter(this.fadeFilter, SpriteLocation.WORLD);

    // Hide everything for now
    this.dialogueBox.enabled = false;
    this.textActor.enabled = false;
    this.responseBox.enabled = false;
    this.clickToContinue.enabled = false;

    // [mfs]  Throughout the whole program, there are a lot of places where
    //        .remove() is being used, when .enabled=false is preferred.
    for (let o of this.responseBoxes)
      o.enabled = false;
  }

  /**
   * Change the dialogue portrait to a different emotion
   *
   * @param emote the emote to switch to (Talk, Nod, Shake)
   */
  private changePortrait(emote: string) {
    // Remove old text and portrait
    this.dialogueBox.appearance.pop();
    this.dialogueBox.appearance.pop();

    // Add text
    let title = new TextSprite({ center: true, face: stage.config.textFont, color: "#FFFFFF", size: 25, offset: { dx: -5, dy: -1.45 }, z: 2 }, () => this.npc!.name);
    this.dialogueBox.appearance.push(title);
    title.actor = this.dialogueBox;

    // Add portrait
    let portrait = new AnimatedSprite({ width: 2.6, height: 2.6, animations: makeEmoteAnimation(this.npc!.portrait, emote), offset: { dx: -5.9, dy: 0.18 }, z: 2 });
    this.dialogueBox.appearance.push(portrait); // Add the new portrait
    portrait.actor = this.dialogueBox; // There is a two way link between an AppearanceComponent and Actor so assign the appearance component an actor.
  }

  /**
   * Make it look like the portrait has paused, by replacing the portrait with
   * the Talk0 frame
   */
  private pausePortrait() {
    this.dialogueBox.appearance.pop();
    let portrait = new ImageSprite({ width: 2.6, height: 2.6, img: this.npc!.portrait + "Talk0.png", offset: { dx: -5.9, dy: 0.18 }, z: 2 });
    this.dialogueBox.appearance.push(portrait);
    portrait.actor = this.dialogueBox;
  }

  /**
   * Start a new dialogue with a character by updating all required
   * variables and then opening dialogue UI.
   *
   * @param npc     The NPC (for images)
   * @param driver  The dialogue driver to use for this dialogue
   */
  public newDialogue(npc: NpcConfig, driver: DialogueDriver) {
    this.npc = npc;
    this.driver = driver;

    if (this.showing) return;

    let lInfo = stage.storage.getLevel("levelInfo") as LevelInfo;
    // [mfs]  It seems that sometimes, an Inspectable or Dialogue won't supress
    //        *all* of the controls, and we can still move around and/or press
    //        HUD buttons and/or press "E".  Someone should look into this.
    lInfo.keyboard?.stopPlayerControls()

    // Blur the background
    this.fadeFilter.enabled = true;
    this.fadeFilter.toggled = true;

    // Enable dialogue UI, reset text, start the text animation
    this.dialogueBox.enabled = true;
    this.textActor.enabled = true;
    this.showing = true;
    this.textAppearance = "";
    this.animateDialogue();
  }

  /**
   * Advance the conversation depending on which response the user has chosen
   *
   * @param response  Defaults to 0. What response the user has chosen, starts at
   *                index 0;
   */
  private next(response: number = 0) {
    // Check if this is the end of the dialogue, close box if so.
    if (this.driver!.conversation.responses.length <= 0 && this.driver!.conversation.responses instanceof Array) {
      this.closeDialogue();
      return;
    }
    // Validate response and choose it
    else if (response <= this.driver!.conversation.responses.length && response >= 0) {
      this.driver?.advance(response);
      this.animateDialogue(); // Animate the text
      return;
    }
    // Invalid response
    throw "Error: Invalid conversation advancement response.";
  }

  /** Animate dialogue text and trigger new lines as necessary */
  private animateDialogue() {
    this.textAppearance = ""; // Initially we show no text
    this.changePortrait(this.driver!.conversation.emote);

    // Make a string with newlines as needed
    let currtext = textSlicer(42, this.driver!.conversation.text).newText;

    // Animate the inspect text.  We do this with a bunch of one-shot timers
    // staggered by .015 seconds
    let i = 0;
    for (let j = 0; j < currtext.length; j++)
      stage.world.timer.addEvent(new TimedEvent(.015 * j, false, () => {
        this.textAppearance += currtext.charAt(i++);
      }));

    // Jump immediately if autoskip is enabled
    if (this.driver!.conversation.autoskip && typeof this.driver!.conversation.responses === "string") {
      stage.world.timer.addEvent(new TimedEvent(.015 * this.driver!.conversation.text.length + 0.8, false, () => { this.next() }));
    }

    // Otherwise open responses
    else {
      stage.world.timer.addEvent(new TimedEvent(.015 * this.driver!.conversation.text.length, false, () => {
        // clickToContinue is only enabled when there are no responses to choose from
        if (typeof this.driver!.conversation.responses === "string" || this.driver!.conversation.responses.length == 0) {
          this.clickToContinue.enabled = true;
        }
        else if (!this.responseState) {
          this.responseBox.enabled = true;
          for (let i = 0; i < this.driver!.conversation.responses.length; ++i) {
            this.responseBoxes[i].enabled = true;
            this.responseTexts[i] = this.driver!.conversation.responses[i].text;
          }
        }
        this.responseState = true;
      }));
    }

    // Pause the portrait when the text is done displaying
    stage.world.timer.addEvent(new TimedEvent(Math.ceil(.015 * this.driver!.conversation.text.length), false, () => { this.pausePortrait() }));
  }

  /** Close the dialogue UI and reset state */
  private closeDialogue() {
    if (!this.showing) return;

    this.fadeFilter.toggled = false;
    this.dialogueBox.enabled = false;
    this.textActor.enabled = false;
    this.showing = false;

    let lInfo = stage.storage.getLevel("levelInfo") as LevelInfo;
    lInfo.hud!.toggleModal('dialogue');
    lInfo.keyboard?.startPlayerControls();
    this.driver!.endFunc(this.driver!.footprints);
  }

  /** Close all player response menus */
  private closeResponses() {
    if (!this.responseState) return;

    this.clickToContinue.enabled = false;
    this.responseState = false;
    this.responseBox.enabled = false;
    for (let box of this.responseBoxes)
      box.enabled = false;
  }
}