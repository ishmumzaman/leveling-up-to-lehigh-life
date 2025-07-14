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
        // Objective 0: Go to your advisor
        new Objective(
          "Go to your advisor",
          "Walk to your advisor's office in...",
          [
            new Step("Talk to Sofia", () => {
              console.log("Reached Sofia step");
              if (!this.sofia) {
                console.warn("Sofia actor not cached yet");
                return;
              }
              console.log("Binding Sofia dialogue:", sofia_questStart);
              const driver = new DialogueDriver(sofia_questStart, "start", () => this.advance());
              (this.sofia.extra as NpcBehavior).setNextDialogue(driver);
            }),
            new Step("Talk to the nervous Student", () => {
              console.log("Reached NervousStudent step");
              if (!this.nervousStudent) {
                console.warn("NervousStudent actor not cached yet");
                return;
              }
              const driver = new DialogueDriver(nervousStudent_quest, "start", () => this.advance());
              (this.nervousStudent.extra as NpcBehavior).setNextDialogue(driver);
            }),
            new Step("Have a conversation with your advisor", () => {
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
          0
        ),

        // Objective 1: Reflect on the Advisor Visit
        new Objective(
          "Reflect on the Advisor Visit",
          "Talk to people about the advisor visit.",
          [
            new Step("Talk to Erick.", () => {
              console.log("Reached Erick step");
              if (!this.erick) {
                console.warn("Erick actor not cached yet");
                return;
              }
              const driverExtra = new DialogueDriver(sofia_postAdvisor, "start");
              (this.sofia?.extra as NpcBehavior).setNextDialogue(driverExtra);

              const driver = new DialogueDriver(erick_quest, "start", () => this.advance());
              (this.erick.extra as NpcBehavior).setNextDialogue(driver);
            })
          ],
          QuestNames.VisitAdvisor,
          1
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
    setTimeout(() => {
      this.forceOnReach();
    }, 0);
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
