import { Quest, Objective, Step }   from "./questLogic";
import { QuestNames }               from "./questNames";
import { Places }                   from "../places/places";
import { Actor }                    from "../../jetlag";
import { NpcNames, NpcBehavior }    from "../characters/NPC";
import { DialogueDriver }           from "../interactions/dialogue";
import { stage }                    from "../../jetlag/Stage";
import { SessionInfo }              from "../storage/session";
import { QuestStorage }             from "../storage/questStorage";

// NPC dialogue maps
import { sofia_questStart, sofia_postAdvisor }       from "../interactions/sofiaDlg";
import { nervousStudent_quest }    from "../interactions/nervousStudentDlg";
import { advisor_quest }           from "../interactions/advisorDlg";
import { erick_quest }             from "../interactions/erickDlg";

export class FindAdvisorQuest extends Quest {
  // Cache references to the already‐placed NPCs
  private sofia?: Actor;
  private nervousStudent?: Actor;
  private advisor?: Actor;
  private erick?: Actor;

  constructor() {
    super(
      QuestNames.VisitAdvisor,
      "Drop by your advisor’s office and check in.",
      [
        // Objective 0: Talk to Sofia
        new Objective(
          "Talk to Sofia",
          "Hear from someone who just visited their advisor",
          [
            new Step("Talk to the student outside the building.", () => {
              console.log("Reached Sofia step");
              if (!this.sofia) {
                console.warn("Sofia actor not cached yet");
                return;
              }
              const map = this.activeObjectiveIndex() >= 2
                ? sofia_postAdvisor
                : sofia_questStart;
              console.log("Binding Sofia dialogue:", map);
              const driver = new DialogueDriver(map, "start", () => this.advance());
              (this.sofia.extra as NpcBehavior).setNextDialogue(driver);
            })
          ],
          QuestNames.VisitAdvisor,
          0
        ),

        // Objective 1: Reassure the nervous student
        new Objective(
          "Reassure a nervous student",
          "Talk to the nervous student waiting outside",
          [
            new Step("Talk to the nervous student.", () => {
              console.log("Reached NervousStudent step");
              if (!this.nervousStudent) {
                console.warn("NervousStudent actor not cached yet");
                return;
              }
              const driver = new DialogueDriver(nervousStudent_quest, "start", () => this.advance());
              (this.nervousStudent.extra as NpcBehavior).setNextDialogue(driver);
            })
          ],
          QuestNames.VisitAdvisor,
          1
        ),

        // Objective 2: Check in with your advisor
        new Objective(
          "Check in with your advisor",
          "Have a short conversation and ask questions",
          [
            new Step("Talk to your advisor.", () => {
              console.log("Reached Advisor step");
              if (!this.advisor) {
                console.warn("Advisor actor not cached yet");
                return;
              }
              const driver = new DialogueDriver(advisor_quest, "start", () => this.advance());
              (this.advisor.extra as NpcBehavior).setNextDialogue(driver);
            })
          ],
          QuestNames.VisitAdvisor,
          2
        ),

        // Objective 3: Reflect with Erick
        new Objective(
          "Reflect with Erick",
          "Tell Erick how it went at the quad",
          [
            new Step("Talk to Erick.", () => {
              console.log("Reached Erick step");
              if (!this.erick) {
                console.warn("Erick actor not cached yet");
                return;
              }
              const driver = new DialogueDriver(erick_quest, "start", () => this.advance());
              (this.erick.extra as NpcBehavior).setNextDialogue(driver);
            })
          ],
          QuestNames.VisitAdvisor,
          3
        ),
      ],
      /* startFunc  */ undefined,
      /* endFunc    */ () => {
        // this runs immediately after the final Step of Objective #3 completes
        console.log("FindAdvisorQuest complete!");
        // e.g. send a Journal entry, remove the quest NPC, spawn your reward, etc.
      },
    );
  }

  // From QuestLogic: starts or resumes the current step, calling its onReach callback
  public onBuildPlace(place: Places, level: number): void {
    const s = stage.storage.getSession("sStore") as SessionInfo;
    if (s.currQuest !== this) {
      console.log("onBuildPlace: not current quest");
      return;
    }
    console.log("onBuildPlace: starting step for FindAdvisorQuest");
    //setTimeout(() => {
      //this.start();
    //}, 0);
  }

  /**
   * Caches each Actor as they're instantiated by the level loader.
   * HawksQuest does the same for its key NPCs (e.g. Jake in the dorm).
   */
  public onMakeNpc(place: Places, level: number, npc: Actor): void {
    const s = stage.storage.getSession("sStore") as SessionInfo;
    if (s.currQuest !== this) {
      console.log("onMakeNpc: not current quest");
      return;
    }

    if (npc.extra instanceof NpcBehavior) {
      console.log("onMakeNpc: Caching", npc.extra.name);
      switch (npc.extra.name) {
        case NpcNames.Sofia:
          this.sofia = npc;
          break;
        case NpcNames.NervousStudent:
          this.nervousStudent = npc;
          break;
        case NpcNames.Advisor:
          this.advisor = npc;
          break;
        case NpcNames.Erick:
          this.erick = npc;
          break;
      }
    }
  }
}
