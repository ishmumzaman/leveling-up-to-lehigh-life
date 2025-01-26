// Reviewed on 2024-09-27

import { QuestNames } from "./questNames";
import { Places } from "../places/places"
import { Actor } from "../../jetlag";

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
  private currStep = 0;

  /**
   * Create an Objective
   *
   * @param name        The name of the objective.
   * @param description The description of the objective.
   * @param steps       All the steps required to complete the objective
   */
  constructor(readonly name: string, readonly description: string, private steps: Step[]) { }

  /** Starts the objective */
  public start() {
    this.currStep = 0;
    this.steps[0].onReach();
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
    this.steps[0].onReach();
  }

  /** Return the status text of the objective */
  public statusText() { return this.steps[this.currStep].displayText; }

  /** Report if the objective is completed */
  public isComplete() { return this.currStep == this.steps.length - 1; }
}

/** A Quest consists of multiple objectives that need to be achieved */
export abstract class Quest {
  /** The index of the current objective */
  private currObjective = 0;

  /**
   * Creates a new Quest instance.
   * 
   * @param which       The Id of the quest
   * @param name        The display name of the quest
   * @param description The description of the quest
   * @param objectives  The quest objectives array
   * @param startFunc   The function to be called when the quest starts.
   * @param endFunc     The function to be called when the quest is completed.
   * @param rewardFunc  The rewards of the quest.
   */
  constructor(readonly which: QuestNames, readonly name: string, readonly description: string, readonly objectives: Objective[], private startFunc?: () => void, private endFunc?: () => void, private rewardFunc?: () => void) {
  }

  /** Start a quest */
  public start() {
    // [mfs] After a quest completes, can it be started again?
    if (this.startFunc) this.startFunc();
    this.objectives[this.currObjective].start();
  }

  /**
   * Advances one step of the current objective.  This might finish an objective
   * and move to the next.  It might also finish the quest.
   *
   * [mfs]  There was a note: "If you want to instantly start the next objective
   *        when the current one is completed, call qAdvance() twice".  I'm not
   *        sure I understand.  Why wouldn't we start the next objective
   *        immediately?
   */
  public advance() {
    if (this.isComplete()) return;

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
      }
    } else {
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
}