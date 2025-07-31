import { Actor, AnimatedSprite, AnimationState, BoxBody, FilledRoundedBox, ImageSprite, ManualMovement, Path, PathMovement, SpriteLocation, stage, TextSprite, TimedEvent } from "../../jetlag";
import { Quest, Objective, Step }   from "./questLogic";
import { QuestNames }               from "./questNames";
import { Places }                   from "../places/places";
import { NpcNames, NpcBehavior, moveTo, adjustHitBox, spawnRegularNpc }    from "../characters/NPC";
import { DialogueDriver }           from "../interactions/dialogue";
import { SessionInfo }              from "../storage/session";
import { LevelInfo }                from "../storage/level";
import { Conversation, ConversationResponse } from "../interactions/conversation";
import { FadingBlurFilter } from "../common/filter";
import { StationInventoryUI } from "../inventory/ui";

// NPC dialogue maps
import { GLOBOWL_quest, DINER_quest, SIMPLE_SERVINGS_quest, VEG_OUT_quest, STACKS_quest, station_visited } from '../interactions/rathStationsDlg';
import { casey_questObj0_start, casey_questObj0_mid, casey_questObj1_start  } from "../interactions/caseyDlg";

// Inspectables
import { InspectSystem } from "../interactions/inspectUi";
import { Inspectable } from "../interactions/inspectables";
import { Inventory } from "../inventory/inventory";
import { ItemType, GameItems, RathboneDish, Items } from "../inventory/item";
import { Spawner } from "../common/spawner";

export class PerfectRathPlateQuest extends Quest {
  // Cache references to the already‐placed NPCs
  private maria?: Actor;
  private casey?: Actor;
  private GLOBOWL?: Actor;
  private SimpleServings?: Actor;
  private VegOut?: Actor;
  private Stacks?: Actor;
  private Diner?: Actor;
  //other refrences like spawenrs and inventories
  private spawners: Spawner[] = [];
  private currStation?: StationInventoryUI;
  private plate?: Inventory;
  private stationInventories: Inventory[] = [];

  //expo demo trackers
  private demoTasteScore: number = 0;
  private demoNutrientsScore: number = 0;

  constructor() {
    
    super(
      QuestNames.RathQuest,
      "Master the Rathbone Dining Hall",
      [
        // Objective 0: Find the different food stations
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

              // removing the old instance of Casey NPC to replace with the moving one
              (this.casey?.extra as NpcBehavior).staticSpawner.sensorOff();
              this.casey?.remove();

              //spawn a walking casey NPC
              let path_casey = new PathMovement(new Path().to(24.5, 28.3).to(20.6, 28.3).to(20.6, 19.68).to(13.9, 19.68).to(13, 17.84).to(13, 13.6).to(5.3, 13.6).to(5.2, 10.5).to(5.2, 11.1), 2.2, false);
              this.casey = spawnRegularNpc(NpcNames.Casey, 5.2, 11.1, AnimationState.IDLE_S, path_casey);
              path_casey.start();

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
              setTimeout(() => {
                let obj0Done = new InspectSystem(Inspectable.RATHBONE_OBJ0_DONE, () => {filter.enabled = false; this.advance();});
                obj0Done.open();
                let filter = new FadingBlurFilter(2, 5, false);
                stage.renderer.addFilter(filter, SpriteLocation.WORLD);
                filter.enabled = true;
              }, 300);
            }),
          ],
          QuestNames.RathQuest,
          0
        ),
        // Objective 1: Put together a plate of food*/
        new Objective(
          "Build The Perfect Plate",
          "Perfect a plate with 4 food items",
          [
            new Step("Talk to Casey", () => {
              console.log("Second Objective started!");
              const driver = new DialogueDriver(casey_questObj1_start, "start", () => this.advance());
              (this.casey?.extra as NpcBehavior).setNextDialogue(driver);
            }),
            new Step("Fill up your plate", () => {
              console.log("Filling up the plate step started!");
              // Shrink down the Station NPCs' hitboxes so new spawners can be created
              adjustHitBox(this.GLOBOWL!, 0.5);
              adjustHitBox(this.SimpleServings!, 0.5);
              adjustHitBox(this.VegOut!, 0.5);
              adjustHitBox(this.Stacks!, 0.5);
              adjustHitBox(this.Diner!, 0.5);

              for (let station = 1; station < 6; station++)
              {
                let inventory = new Inventory(3, 6);
                this.stationInventories.push(inventory);
              }
              this.fillStation(this.stationInventories[0], GameItems.GLOBOWLDishes);
              this.fillStation(this.stationInventories[1], GameItems.DinerDishes);
              this.fillStation(this.stationInventories[2], GameItems.SimpleServingsDishes);
              this.fillStation(this.stationInventories[3], GameItems.VegOutDishes);
              this.fillStation(this.stationInventories[4], GameItems.StacksDishes);

              // Create the plate inventory and the StationInventoryUI for each station
              this.plate = new Inventory(2, 2, ItemType.RathboneFood);
              let GLOBOWL = new StationInventoryUI(this.stationInventories[0], this.plate);
              let Diner = new StationInventoryUI(this.stationInventories[1], this.plate);
              let SimpleServings = new StationInventoryUI(this.stationInventories[2], this.plate);
              let VegOut = new StationInventoryUI(this.stationInventories[3], this.plate);
              let Stacks = new StationInventoryUI(this.stationInventories[4], this.plate);
      
              // Make each station interactable
              this.spawners.push(new Spawner(11.45, 23, 2, 2, () => { this.openStation(GLOBOWL) })); 
              this.spawners.push(new Spawner(30.8, 7.15, 2, 2, () => { this.openStation(Diner) })); 
              this.spawners.push(new Spawner(23.1, 22.56, 2, 1.5, () => { this.openStation(SimpleServings) })); 
              this.spawners.push(new Spawner(23.1, 25.38, 2, 1.5, () => { this.openStation(VegOut) })); 
              this.spawners.push(new Spawner(11.03, 9.9, 2, 3, () => { this.openStation(Stacks) }));

              this.plate.onFull = () => {
                stage.world.timer.addEvent(new TimedEvent(0.2, false, () => {
                  console.log("Plate is full!");
                  // Remove all spawners
                  for (let spawner of this.spawners) {spawner.remove();}
                  this.spawners = []; // Clear the spawner references

                  const lInfo = stage.storage.getLevel("levelInfo") as LevelInfo;
                  lInfo.hud?.toggleMode("otherContainer", this.currStation!);
                  let plateFull = new InspectSystem(Inspectable.RATHBONE_PLATE_FULL, () => {filter.enabled = false; this.advance();});
                  let filter = new FadingBlurFilter(2, 5, false);
                  stage.renderer.addFilter(filter, SpriteLocation.WORLD);
                  filter.enabled = true;
                  plateFull.open();
                }));
              }
            }),
            new Step("Talk to Casey", () => {
              // Create a map to store item names as keys and their scores as values
              const items: { [key: string]: number[] } = {};

              let totalTasteScore = 0;
              let totalNutritionScore = 0;

              // Iterate over the items on the plate
              for (let item of this.plate?.items ?? []) {
                const tasteScore = (item as RathboneDish).getTasteScore() ?? 0;
                const nutritionScore = (item as RathboneDish).getNutritionScore() ?? 0;

                items[item.name] = [tasteScore, nutritionScore];

                // Accumulate the total scores
                totalTasteScore += tasteScore;
                totalNutritionScore += nutritionScore;
              }

              // Determine the plate category based on the scores
              let response = "";
              if (totalTasteScore >= 28 && totalNutritionScore >= 28) {
                response = "Your plate is perfectly balanced, both tasty and nutritious!";
              } else if (totalTasteScore >= 28 && totalNutritionScore < 28) {
                response = "Your plate is delicious, but it could use more nutrition.";
              } else if (totalTasteScore < 28 && totalNutritionScore >= 28) {
                response = "Your plate is healthy, but it could use more flavor.";
              } else {
                response = "Your plate is unbalanced. It's lacking both flavor and nutrition.";
              }

              // Use the keys of the `items` map to construct the plateItems string
              const plateItems = Object.keys(items).join(", ") || "nothing";

              let plateContent = `Your plate contains: ${plateItems}.`;
              let score = `Your total taste score is ${totalTasteScore}, and your total nutrition score is ${totalNutritionScore}. ${response}`;

              let repeatConvo = new Map<string, Conversation>([
                ["start", new Conversation("Hello bro! Looks like your plate is full. Let's see what you got.", [
                  new ConversationResponse("I hope you like it!", "plateContent"),
                ])],
                ["plateContent", new Conversation(plateContent, [
                  new ConversationResponse("What is my score?", "score")
                ])],
                ["score", new Conversation(score, [
                  new ConversationResponse("Oh!", "continue")
                ])],
                ["continue", new Conversation("Would you like to try the challange again?", [
                  new ConversationResponse("Yes please!", "repeat", 1),
                  new ConversationResponse("No I am happy with my score.", "end")
                ])],
                ["repeat", new Conversation("Alright! go grab another plate!", [])],
                ["end", new Conversation("Alright. let's go eat our food now!", [])],
              ]);

              // Log the results for debugging
              console.log("Items on the plate with scores:", items);
              console.log(`Total Taste Score: ${totalTasteScore}`);
              console.log(`Total Nutrition Score: ${totalNutritionScore}`);
              console.log("Response:", response);

              // Create a dialogue driver for the conversation
              const driver = new DialogueDriver(repeatConvo, "start", (footprints) => {
                if (footprints.has(1)) {
                  console.log("Player chose to repeat the challenge.");
                  this.plate?.clear();
                  this.objectives[1].startFrom(1);
                }
                else {
                  console.log("Player chose to end the quest.");
                  this.demoTasteScore = totalTasteScore;
                  this.demoNutrientsScore = totalNutritionScore;
                  this.advance();
                }
              });
              (this.casey?.extra as NpcBehavior).setNextDialogue(driver);

            }),
            new Step("Objective Completed!", () => {
              console.log("Second Objective complete!");
              // [haa] this part is only for the expo demo
              let recap = `Aww thanks! Just to recap. Your taste score was ${this.demoTasteScore}, and your nutrition score was ${this.demoNutrientsScore}.`;
              let demoEnd = new Map<string, Conversation>([
                ["start", new Conversation("Thank you for playing our little demo! We would love any feedback you could leave us!", [
                  new ConversationResponse("LUTLL is Awesome!", "end"),
                ])],
                ["end", new Conversation(recap, [])],
              ]);
              const driver = new DialogueDriver(demoEnd, "start", () => this.advance());
              (this.casey?.extra as NpcBehavior).setNextDialogue(driver);
              (this.casey?.extra as NpcBehavior).nextDialogue();
            }),
          ],
          QuestNames.RathQuest,
          1
        ),
        // Final Objective: Returning the plates
        /*new Objective(
          "Don't forget your plates!",
          "Learn how to return your plates.",
          [
            new Step("Return your plates?", () => {
              console.log("Third Objective started!");
            }),
          ],
          QuestNames.RathQuest,
          2
        ),*/
      ],
      /* startFunc  */ undefined,
      /* endFunc    */ () => {
        // this runs immediately after the final Step of final Objectove completes
        console.log("PerfectRathPlateQuest complete!");
        adjustHitBox(this.GLOBOWL!, 1);
        adjustHitBox(this.SimpleServings!, 1);
        adjustHitBox(this.VegOut!, 1);
        adjustHitBox(this.Stacks!, 1);
        adjustHitBox(this.Diner!, 1);
      },
      /* rewardFunc */ undefined,
      /* onResume   */ () => {
        // This runs when the quest is resumed from a paused state
        console.log("PerfectRathPlateQuest resumed!");
        if (this.activeObjectiveIndex() > 0 || this.activeObjectiveIndex() === 0 && this.objectives[0].activeStepIndex() > 0) {
          moveTo(this.casey!, 5.2, 11.1);
        }
      }
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
      console.log("All stations visited, advancing quest.");
      stage.world.timer.addEvent(new TimedEvent(0.2, false, () => {this.advance();}));
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

  public openStation(station: StationInventoryUI) {
    const lInfo = stage.storage.getLevel("levelInfo") as LevelInfo;
    lInfo.hud?.toggleMode("otherContainer", station);
    this.currStation = station;
  }

  /**
   * Fill some slots of the shelves (about 30% of the slots on average) with items
   * @param areDrinks if the shelves are filled with drinks or not
   */
  public fillStation(i: Inventory, items: Items[]): void {
    for (let j = 0; j < items.length; j++) {
      const item = items[j];
      i.addItem(GameItems.getItem(item));
    }
  }
}


