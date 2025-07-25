import { Quest, Objective, Step }   from "./questLogic";
import { QuestNames }               from "./questNames";
import { Places }                   from "../places/places";
import { Actor }                    from "../../jetlag";
import { NpcNames, NpcBehavior, moveTo }    from "../characters/NPC";
import { DialogueDriver }           from "../interactions/dialogue";
import { stage }                    from "../../jetlag/Stage";
import { SessionInfo }              from "../storage/session";
import { QuestStorage }             from "../storage/questStorage";

// NPC dialogue maps
import { GLOBOWL_quest, DINER_quest, SIMPLE_SERVINGS_quest, VEG_OUT_quest, STACKS_quest, station_visited } from '../interactions/rathStationsDlg';
import { casey_questObj0_start, casey_questObj0_mid  } from "../interactions/caseyDlg";

export class PerfectRathPlateQuest extends Quest {
  // Cache references to the already‐placed NPCs
  private maria?: Actor;
  private casey?: Actor;
  private GLOBOWL?: Actor;
  private SimpleServings?: Actor;
  private VegOut?: Actor;
  private Stacks?: Actor;
  private Diner?: Actor;

  constructor() {
    super(
      QuestNames.RathPlateQuest,
      "Master the Rathbone Dining Hall",
      [
        // Objective 0: Build the Find the different food stations
        new Objective(
          "Explore Rathbone",
          "Learn what Rathbone has to offer",
          [
            new Step("Talk to Casey", () => {
              console.log("First Objective started!");
              const driver = new DialogueDriver(casey_questObj0_start, "start", () => this.advance());
              (this.casey?.extra as NpcBehavior).setNextDialogue(driver);
            }),
            new Step("Visit all 5 stations", () => {
              console.log("Reached the Stations' visit step");
              // Create a dialogue driver for the station visited message
              const finishedDriver = new DialogueDriver(station_visited, "start");

              // Create dialogue drivers for each station
              const GLOBOWLDriver = new DialogueDriver(GLOBOWL_quest, "start", () => {this.visitStation("GLOBOWL"); this.objectiveBindDialouge(this.GLOBOWL!, finishedDriver, 0);});
              const DinerDriver = new DialogueDriver(DINER_quest, "start", () => {this.visitStation("DINER"); this.objectiveBindDialouge(this.Diner!, finishedDriver, 0);});
              const SimpleServingsDriver = new DialogueDriver(SIMPLE_SERVINGS_quest, "start", () => {this.visitStation("SIMPLE_SERVINGS"); this.objectiveBindDialouge(this.SimpleServings!, finishedDriver, 0);});
              const VegOutDriver = new DialogueDriver(VEG_OUT_quest, "start", () => {this.visitStation("VEG_OUT"); this.objectiveBindDialouge(this.VegOut!, finishedDriver, 0);});
              const StacksDriver = new DialogueDriver(STACKS_quest, "start", () => {this.visitStation("STACKS"); this.objectiveBindDialouge(this.Stacks!, finishedDriver, 0);});

              // create a dialogue driver for Casey's mid-objective dialogue
              const caseyDriver = new DialogueDriver(casey_questObj0_mid, "start");

              // Set the dialogue drivers for each Station NPC
              // I set on interact logic to bind this custom interaction logic to objective step only
              this.objectiveBindDialouge(this.casey!, caseyDriver, 0);
              (this.GLOBOWL?.extra as NpcBehavior).setNextDialogue(GLOBOWLDriver);
              (this.Diner?.extra as NpcBehavior).setNextDialogue(DinerDriver);
              (this.SimpleServings?.extra as NpcBehavior).setNextDialogue(SimpleServingsDriver);
              (this.VegOut?.extra as NpcBehavior).setNextDialogue(VegOutDriver);
              (this.Stacks?.extra as NpcBehavior).setNextDialogue(StacksDriver);
            }),
            new Step("Objective complete!", () => {
              console.log("First Objective complete!");
              moveTo(this.casey!, 22.5,  28.3); // Move Casey to a new position
              this.advance();
            })
          ],
          QuestNames.VisitAdvisor,
          0
        ),
      ],
      /* startFunc  */ undefined,
      /* endFunc    */ () => {
        // this runs immediately after the final Step of final Objectove completes
        console.log("PerfectRathPlateQuest complete!");
        // e.g. send a Journal entry, remove the quest NPC, spawn your reward, etc.
      },
    );
  }

  // From QuestLogic: resumes the current step, calling its onReach callback
  public onBuildPlace(place: Places, level: number): void {
    const s = stage.storage.getSession("sStore") as SessionInfo;
    if (s.currQuest !== this) {
      console.log("onBuildPlace: not current quest");
      return;
    }
    console.log("onBuildPlace: starting step for PerfectRathPlateQuest");
    setTimeout(() => {
      this.forceOnReach();
    }, 0);
  }

  /**
   * Caches each Actor as they're instantiated by the level loader.
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
        case NpcNames.Maria:
          this.maria = npc;
          break;
        case NpcNames.Casey:
          this.casey = npc;
          break;
        case NpcNames.GLOBOWL:
          this.GLOBOWL = npc;
          break;
        case NpcNames.SIMPLE_SERVINGS:
          this.SimpleServings = npc;
          break;
        case NpcNames.VEG_OUT:
          this.VegOut = npc;
          break;
        case NpcNames.STACKS:
          this.Stacks = npc;
          break;
        case NpcNames.DINER:
          this.Diner = npc;
          break;
      }
    }
  }

  private stationsVisited = 0;
  private visitedStations = new Set<string>();

  public visitStation(stationId: string): void {
    if (this.visitedStations.has(stationId))
    {
      console.log(`Already visited station: ${stationId}`);
      return;
    }
    this.visitedStations.add(stationId);
    this.stationsVisited++;
    console.log(`Visited Station: ${stationId}`);

    if (this.stationsVisited === 5 && this.activeObjectiveIndex() === 0) {
      this.advance();
    }
  }

  public objectiveBindDialouge(NPC: Actor, driver: DialogueDriver, ObjectiveIndex: number): void {
    const NPCBehavior = NPC?.extra as NpcBehavior;
    NPCBehavior.onInteract = () => {
      if (this.activeObjectiveIndex() !== ObjectiveIndex) {
        delete NPCBehavior.onInteract;
        NPCBehavior.nextDialogue();
      }
      else
      {
        NPCBehavior.setNextDialogue(driver);
        NPCBehavior.nextDialogue();
      }
    };
  }
}
