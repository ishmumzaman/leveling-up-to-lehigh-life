// Reviewed on 2024-09-27

import { QuestNames } from "./questNames";
import { Places } from "../places/places"
import { Actor } from "../../jetlag";
import { QuestStorage } from "../storage/questStorage";
import { stage } from "../../jetlag/Stage";
import { SessionInfo } from "../storage/session";
import { on } from "hammerjs";

/** A step within an Objective */
export class Step {
  /**
   * Create a step for an objective
   *
   * @param displayText The text to show when this is the current step
   * @param onReach     The function to run when this step is reached
   */
  constructor(readonly displayText: string, readonly onReach: (() => void) = () => { }) { }
}

/**
 * Represents each objective that is part of a quest.
 *
 * Each objective comprises of multiple steps that needs to be fulfilled to be
 * completed.
 */
export class Objective {
  /** The index of the current step of the objective */
  private currStep: number;

  /**
   * Create an Objective
   * @param name - Objective name
   * @param description - Objective description
   * @param steps - Sequence of steps in this objective
   * @param questName - Associated quest ID
   * @param objectiveIndex - Index in the quest
   * @param stepIndex - Step to start from (optional)
   */
  constructor(
    readonly name: string,
    readonly description: string,
    private steps: Step[],
    private questName: QuestNames,
    private objectiveIndex: number,
    stepIndex: number = 0
  ) {
  this.currStep = stepIndex;
  }

  /** Saves the current step and objective index to storage */
  public pause() {
    const s = stage.storage.getSession("sStore") as SessionInfo;
    s.currQuest = undefined; // Clear the current quest to avoid confusion
    QuestStorage.setPausedProgress(this.questName, {
      objectiveIndex: this.objectiveIndex,
      stepIndex: this.currStep,
    });
    QuestStorage.setStatus(this.questName, "Paused");
  }

  /**
   * Starts this objective from a specific step.
   * @param stepIndex - Step index to resume from
   */
  public startFrom(stepIndex: number) {
    this.currStep = stepIndex;
    if (this.steps[this.currStep]) {
      this.steps[this.currStep].onReach();
    }
  }

  /** Starts the objective */
  public start() {
    this.currStep = 0;
    this.steps[this.currStep].onReach();
  }

  /** Just fire onReach for the step you’re already in */
  public forceOnReach() {
    this.steps[this.currStep].onReach();
  }

  /**
   * Advances the objective to the next step, which might end the objective.
   * Runs the appropriate function.
   */
  public advance() {
    if (this.isComplete()) return;

    // Advancing might finish, in which case we run the endFunc instead of
    // advanceFunc.
    this.currStep++;
    this.steps[this.currStep].onReach();
  }

  /** Return the status text of the objective */
  public statusText() { return this.steps[this.currStep].displayText; }

  /** Report if the objective is completed */
  public isComplete() { return this.currStep == this.steps.length - 1; }

  public activeStep() {
    return (this.isComplete()) ? undefined : this.steps[this.currStep];
  }

  /** Return the index of the currently active step */
  public activeStepIndex() { return this.currStep; }
}

/** A Quest consists of multiple objectives that need to be achieved */
export abstract class Quest {
  /** The index of the current objective */
  private currObjective = 0;

  /** The unread status of the class to determine the quest notification*/
  private unread = true;

  public name: String; // For compatibility with older code

  /**
   * Creates a new Quest instance.
   * @param questName   The name of the quest, used for storage and identification (from QuestNames enum)
   * @param description The description of the quest
   * @param objectives  The quest objectives array
   * @param startFunc   The function to be called when the quest starts.
   * @param endFunc     The function to be called when the quest is completed.
   * @param rewardFunc  The rewards of the quest.
   */
  constructor(readonly questName: QuestNames, readonly description: string, readonly objectives: Objective[], private startFunc?: () => void, private endFunc?: () => void, private rewardFunc?: () => void, private onResume?: () => void) {
    this.name = questName; // For compatibility with older code
  }

  /** Starts the quest from stored progress or from the beginning */
  public start() {
    const progress = QuestStorage.getPausedProgress(this.questName);
    // If there is progress stored, resume from the last objective and step
    if (progress) {
      const { objectiveIndex, stepIndex } = progress;
      if (this.objectives[objectiveIndex]) {
        this.objectives[objectiveIndex].startFrom(stepIndex);
        this.onResume?.();
        QuestStorage.clearPausedProgress(this.questName); // Clear the paused progress after restarting
        return;
      }
    }
    // If no progress is stored, start from the beginning
    this.objectives[0].start();
    QuestStorage.setStatus(this.questName, "Active");
  }

  /** Pauses the currently active objective */
  public pause() {
    this.objectives[this.currObjective].pause();
  }

  public forceOnReach() {
    if (this.currObjective < this.objectives.length) {
      this.objectives[this.currObjective].forceOnReach();
    }
  }

  /**
   * Advances one step of the current objective.  This might finish an objective
   * and move to the next.  It might also finish the quest.
   *
   * [mfs]  There was a note: "If you want to instantly start the next objective
   *        when the current one is completed, call advance() twice".  I'm not
   *        sure I understand.  Why wouldn't we start the next objective
   *        immediately?
   */
  public advance() {
    if (this.isComplete()) return;

    // If adavancing the current objective finishes it, we need to start the next one.
    if (this.objectives[this.currObjective].isComplete()) {
      this.currObjective++;
      // Is there another objective to start?
      if (this.currObjective < this.objectives.length) {
        this.objectives[this.currObjective].start();
      }
      // If not, run the end function and the rewards
      else {
        if (this.endFunc) this.endFunc();
        if (this.rewardFunc) this.rewardFunc();
        QuestStorage.setStatus(this.questName, "Completed");
        const s = stage.storage.getSession("sStore") as SessionInfo;
        s.currQuest = undefined; // Clear the current quest to avoid confusion
      }
    }
    // Otherwise, just advance the current objective
    else {
      this.objectives[this.currObjective].advance();
    }
  }

  /** Report if the quest is complete */
  public isComplete() { return this.currObjective == this.objectives.length; }

  /** Report the total number of objectives */
  public numObjectives() { return this.objectives.length; }

  /** Return the currently active objective */
  public activeObjective() {
    return (this.isComplete()) ? undefined : this.objectives[this.currObjective];
  }

  /** Return the index of the currently active objective */
  public activeObjectiveIndex() { return this.currObjective; }

  /** Code to run when a place is being built */
  abstract onBuildPlace(place: Places, level: number): void;

  /** Code to run when an NPC actor is being created */
  abstract onMakeNpc(place: Places, level: number, npc: Actor): void;

  public readQuest() { this.unread = false; }

  public get Unread() { return this.unread; }
}