// Reviewed on 2024-10-01

/**
 * ConversationResponse expresses a response that the player can choose to say 
 *
 * Note that the relationship between Conversation, ConversationResponse, and
 * ConversationMap is a bit inside-out.  A Conversation has zero or more
 * ConversationResponses, and the responses have a "next" field that is used to
 * find the follow-on Conversation in the ConversationMap.
 */
export class ConversationResponse {
  /**
   * Construct a ConversationResponse
   *
   * @param text  The text to say 
   * @param next  A string description of the next Conversation unit
   * @param footprint  An integer token used by quests to track responses and direct the next conversation
   */
  constructor(readonly text: string, readonly next: string, readonly footprint?: number) { }
}

/**
 * Conversation captures an NPC's text that they say to the player, and some
 * options for how the player responds.
 */
export class Conversation {
  /**
   * Construct a Conversation object
   *
   * [mfs] The emote should be an enum
   *
   * @param text          The text that the NPC says
   * @param responses     An array of responses that the player may choose, or a string if they have to click-to-continue the current convo
   * @param emote         The NPC's emotion
   * @param autoskip      Should the conversation immediately jump to option 1
   *                      once it's done displaying?
   */
  constructor(readonly text: string, readonly responses: ConversationResponse[] | string, readonly emote: string = "Talk", readonly autoskip: boolean = false) {
    if (this.autoskip && typeof this.responses !== "string")
      throw "Error: cannot use autoskip unless response is a string";
  }
}

/**
 * ConversationMap is a weakly-typed graph that covers a whole conversation
 * between a player and NPC.  It is "weakly" typed, because the keys of the maps
 * are strings, and they are also the "nexts" of the Responses of the
 * Conversation, but we don't have a way for the compiler to check for typos.
 */
export type ConversationMap = Map<string, Conversation>;