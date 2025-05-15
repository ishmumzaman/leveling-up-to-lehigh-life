import { Actor, stage } from "../../jetlag";
import { Quest } from "./questLogic";
import { LevelInfo } from "../storage/level";
import { QuestNames } from "./questNames";
import { Places } from "../places/places";
import { NpcNames, NpcBehavior } from "../characters/NPC";
import { SessionInfo } from "../storage/session";
import { DialogueDriver } from "../interactions/dialogue";
import { roommate_first_time } from "../interactions/roommateDlg";

export class RoommateQuest extends Quest {
  private progress = 0;

  private roommate: { npc?: NpcBehavior, driver?: DialogueDriver } = {};
  private gryphon: { npc?: NpcBehavior, driver?: DialogueDriver } = {};
  private lupdOfficer: { npc?: NpcBehavior, driver?: DialogueDriver } = {};

  constructor() {
    super(QuestNames.RoommateQuest, "Help Your Hallmate Get Back Inside", "Your hallmate is locked out of their room and needs your help!", []);
  }

  onBuildPlace(place: Places, level: number): void { }

  onMakeNpc(place: Places, level: number, npc: Actor): void {
    const npcBehavior = npc.extra as NpcBehavior;

    if (npcBehavior.name === NpcNames.Roommate) {
      this.roommate.npc = npcBehavior;
    }
    if (npcBehavior.name === NpcNames.Gryphon) {
      this.gryphon.npc = npcBehavior;
    }
    if (npcBehavior.name === NpcNames.LUPDOfficer) {
      this.lupdOfficer.npc = npcBehavior;
    }

    if (this.roommate.npc) {
      this.setupRoommateDialogue();
    }
    if (this.gryphon.npc) {
      this.setupGryphonDialogue();
    }
    if (this.lupdOfficer.npc) {
      this.setupLUPDDialogue();
    }
  }

  // IDEAL office treated as main choice
  private setupRoommateDialogue() {
    const endFunc = (footprints: Set<number>) => {
      if (footprints.has(0)) { 
        this.progress = 1;
      } 
      else if (footprints.has(1)) {
        this.progress = 1;
        this.setupLUPDDialogue(); 
      } 
      else if (footprints.has(2)) {
        this.progress = 1;
        this.setupGryphonDialogue(); 
      }
    };
  
    this.roommate.driver = new DialogueDriver(roommate_first_time, "start", endFunc);
    this.roommate.npc?.setNextDialogue(this.roommate.driver);
  }
  
  // Gryphon seperate dialouge called
  private setupGryphonDialogue() {
    const endFunc = () => {
      if (this.progress === 1) {
        this.progress = 2; 
      }
    };
    this.gryphon.driver = new DialogueDriver(roommate_first_time, "gryphon_arrival", endFunc);
    this.gryphon.npc?.setNextDialogue(this.gryphon.driver);
  }

  // Call LUPD seperate dialouge called
  private setupLUPDDialogue() {
    const endFunc = () => {
      if (this.progress === 1) {
        this.progress = 2; 
      }
    };
    this.lupdOfficer.driver = new DialogueDriver(roommate_first_time, "lupd_arrival", endFunc);
    this.lupdOfficer.npc?.setNextDialogue(this.lupdOfficer.driver);
  }
}
