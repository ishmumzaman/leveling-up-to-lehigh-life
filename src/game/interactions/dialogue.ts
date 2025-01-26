// Reviewed on 2024-10-02
import { Conversation, ConversationMap } from "./conversation";

/** DialogueDriver handles the movement through a conversation */
export class DialogueDriver {
  conversation: Conversation; // The current conversation within the map, if any 
  // The sum footprints of any traversed responses with a footprint when going through the dialogue
  footprints: number[] = [];

  /** Code to run when the conversation finishes */
  public endFunc = (footprints_: number[]) => { };

  /**
   * Create a DialogueDriver
   * 
   * @param conversationMap The conversation objects to use for this dialogue
   * @param start           The starting point within conversationMap
   * @param endFunc         The function to run when the conversation ends
   */
  constructor(readonly conversationMap: ConversationMap, private start: string, endFunc?: (footprints_: number[]) => void) {
    let convo = this.conversationMap.get(start);
    if (!convo) throw "Error: Conversation Map does not have a 'start' entry";
    this.conversation = convo;
    if (endFunc) this.endFunc = endFunc;
  }

  /**
   * Advance the conversation.  This uses the index of a chosen response for the
   * current Conversation object to select the next Conversation object
   *
   * @param responseIdx The numerical index of the chosen response
   * @returns The footprint of the chosen response
   */
  public advance(responseIdx: number): any {
    let convo: Conversation | undefined;
    // Get the footprint of the current conversation before updating it
    if (this.conversation.responses instanceof Array) {
      let newFootprint = this.conversation.responses[responseIdx]?.footprint;

      // Check if newFootprint is already in the array before pushing to avoid duplicates
      // [anh] This is a safe guard in case people have duped footprints in a conversationMap,
      //       maybe there is a better way to handle this, or not needed at all.
      if (newFootprint) {
        if (this.footprints.includes(newFootprint))
          throw `Error: Footprint ${newFootprint} already exists in footprints`;
        else {
          this.footprints.push(newFootprint);
        }
      }
      convo = this.conversationMap.get(this.conversation.responses[responseIdx].next);
      if (!convo) throw `Error: ${this.conversation.responses[responseIdx].next} does not exist in the given map`;
    } else {
      convo = this.conversationMap.get(this.conversation.responses);
      if (!convo) throw `Error: ${this.conversation.responses} does not exist in the given map`;
    }

    // Get the next conversation from the map
    this.conversation = convo;
  }

  /**
   * Make a copy of this DialogueDriver
   * 
   * @returns A copy of this DialogueDriver
   */
  public clone() {
    let dialog = new DialogueDriver(this.conversationMap, this.start);
    dialog.endFunc = this.endFunc;
    return dialog;
  }
}