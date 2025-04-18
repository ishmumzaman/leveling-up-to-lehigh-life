// Reviewed on 2024-09-18

// [mfs]  This seems like it's really a MessageBox?  I took out the ability to
//        chain it to future MessageBoxes, and it seems to be OK for what we
//        have right now?
//
// [mfs]  I don't understand why .remove() and .enabled=false are used
//        interchangeably?
//
// [mfs]  I took out the blur, because it wasn't working.  Should it be
//        re-added?

import { Actor, AnimatedSprite, AnimationSequence, AnimationState, BoxBody, ImageSprite, stage, TextSprite, TimedEvent } from "../../jetlag";
import { SessionInfo } from "../storage/session";
import { textSlicer } from '../common/textFormatting';
import { Inspectable } from "./inspectables";
import { LevelInfo } from "../storage/level";

/**
 * A MessageBox that includes the animated face of the speaker, and animated
 * text.
 */
export class InspectSystem {
  /** The text that we want to display in the inspect box */
  private fullText: string;

  /** Track if the Inspect box is showing or not */
  private showing: boolean;

  /** The box that the text appears inside of */
  private containingBox: Actor;

  /** The animated text object that appears on screen */
  private animatedText: Actor;

  /** The text that is drawn.  We construct it character-by-character */
  private currentText: string;

  /** The portrait to show */
  private portrait: Map<AnimationState, AnimationSequence> = new Map();

  /** Which emotion should be used for the portrait animation */
  private emote: string;

  /** The button to press to clear the message box */
  private clearButton: Actor;

  /**
   * Creates an instance of InspectSystem
   *
   * @param inspectable An object with the text to show
   */
  constructor(inspectable: Inspectable) {
    // Get the text from the map
    let sStore = stage.storage.getSession("sStore") as SessionInfo;
    this.fullText = sStore.inspectables.get(inspectable)!.text;

    // Use the emotion to decide on the character animation to use
    this.emote = "Talk";
    switch (this.emote) {
      case "Shake": this.portrait.set(AnimationState.IDLE_E, sStore.playerAppearance!.shake); break;
      case "Nod": this.portrait.set(AnimationState.IDLE_E, sStore.playerAppearance!.nod); break;
      default: this.portrait.set(AnimationState.IDLE_E, sStore.playerAppearance!.talk); break;
    }

    // Make the main UI box
    this.containingBox = new Actor({
      appearance: [new ImageSprite({ width: 15, height: 2.5, img: "dialogueBox.png", z: 2 }),
      new ImageSprite({ width: 2, height: 2, img: "portraitBox.png", offset: { dx: -6, dy: 0 }, z: 2 }),
      new ImageSprite({ width: 4.5, height: .8, img: "characterName.png", offset: { dx: -5, dy: -1.5 }, z: 2 }),
      new TextSprite({ center: true, face: stage.config.textFont, color: "#FFFFFF", size: 25, offset: { dx: -5, dy: -1.45 }, z: 2 }, () => "Me"),
      new AnimatedSprite({ width: 2.6, height: 2.6, animations: this.portrait!, offset: { dx: -5.9, dy: 0.18 }, z: 2 }),],
      rigidBody: new BoxBody({ cx: 8, cy: 7.5, width: 0, height: 0 }, { scene: stage.hud }),
    });

    // Make the inner box where the animated text goes, and clear the text
    this.currentText = "";
    this.animatedText = new Actor({
      rigidBody: new BoxBody({ cx: 3.25, cy: 6.75, width: 0, height: 0 }, { scene: stage.hud }),
      appearance: new TextSprite({ center: false, face: stage.config.textFont, color: "#FFFFFF", size: 22, z: 2 }, () => this.currentText)
    })

    // Make the button for clearing the MessageBox
    this.clearButton = new Actor({
      appearance: [new ImageSprite({ width: .25, height: .5, img: "dialogueArrow.png", z: 2, offset: { dx: 6.75, dy: .95 } })],
      rigidBody: new BoxBody({ cx: 8, cy: 7.3, width: 15, height: 3 }, { scene: stage.hud }),
      gestures: {
        tap: () => {
          this.close();
          return true;
        }
      }
    });

    // Hide it all for now...
    this.containingBox.remove();
    this.animatedText.remove();
    this.clearButton.remove();
    this.showing = false;
  }

  /**
   * Change the dialogue portrait to a different emotion
   *
   * @param emote the emote to switch to - current options: Talk, Nod, Shake
   */
  private changePortrait(emote: string) {
    // NB:  This relies on the portrait being the last appearance of the
    //      containingBox.
    this.containingBox.appearance.pop();
    let sStore = stage.storage.getSession("sStore") as SessionInfo;
    switch (emote) {
      case "Shake": this.portrait.set(AnimationState.IDLE_E, sStore.playerAppearance!.shake); break;
      case "Nod": this.portrait.set(AnimationState.IDLE_E, sStore.playerAppearance!.nod); break;
      default: this.portrait.set(AnimationState.IDLE_E, sStore.playerAppearance!.talk); break;
    }
    let portrait = new AnimatedSprite({ width: 2.6, height: 2.6, animations: this.portrait!, offset: { dx: -5.9, dy: 0.18 }, z: 2 });
    this.containingBox.appearance.push(portrait);
    portrait.actor = this.containingBox;
    this.emote = emote;
  }

  /**
   * Stop the portrait's animation, so it looks like it stopped talking.
   *
   * NB:  This doesn't actually pause the portrait, it just pops it and puts an
   *      image where the animation was
   */
  private pausePortrait() {
    let sStore = stage.storage.getSession("sStore") as SessionInfo;
    this.containingBox.appearance.pop();
    let portrait = new ImageSprite({ width: 2.6, height: 2.6, img: sStore.playerAppearance!.still, offset: { dx: -5.9, dy: 0.18 }, z: 2 });
    this.containingBox.appearance.push(portrait);
    portrait.actor = this.containingBox;
  }

  /**
   * Open a MessageBox
   */
  public open(emote: "Talk" | "Shake" | "Nod" = "Talk") {
    if (!this.showing) {
      let lInfo = stage.storage.getLevel("levelInfo") as LevelInfo;
      lInfo.hud!.toggleModal('inspect');


      // Turn on the UI parts
      this.containingBox.enabled = true;
      this.animatedText.enabled = true;
      this.showing = true;

      // Use the (optional) emotion
      this.emote = emote
      this.changePortrait(this.emote ?? "Talk");

      // format and animates the text
      this.currentText = "";
      const currtext = textSlicer(42, this.fullText).newText;
      let i = 0;
      stage.world.timer.addEvent(new TimedEvent(.015, true, () => {
        this.currentText += currtext.charAt(i++);
      }));

      // Draw the button for closing the UI
      stage.world.timer.addEvent(new TimedEvent(.015 * this.fullText.length, false, () => {
        this.clearButton.enabled = true;
      }));

      // This pauses the portrait when the text is done rendering.
      stage.world.timer.addEvent(new TimedEvent(Math.ceil(.015 * this.fullText.length), false, () => { this.pausePortrait() }));
    }
  }

  /**
   * Close the MessageBox
   */
  private close() {
    if (this.showing) {
      let lInfo = stage.storage.getLevel("levelInfo") as LevelInfo;
      lInfo.hud!.toggleModal('inspect');

      this.containingBox.enabled = false;
      this.animatedText.enabled = false;
      this.clearButton.remove();
      this.showing = false;
    }
  }

}