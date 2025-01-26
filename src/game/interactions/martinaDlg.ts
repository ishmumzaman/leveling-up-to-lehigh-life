// Reviewed on 2024-10-02
import { Conversation, ConversationResponse } from "./conversation";

export let martina_default = new Map<string, Conversation>([
    ["start", new Conversation("Hey, how are you doing?", [
        new ConversationResponse("I'm good", "good")
    ])],
    ["good", new Conversation("Nice to hear that.", [])],
])

export let martina_can_give_direction = new Map<string, Conversation>([
    ["start", new Conversation("Hey, how are you doing?", [
        new ConversationResponse("How do I get to Rathbone?", "rathbone", 1),
        new ConversationResponse("Gtg!", "go")
    ])],
    ["rathbone", new Conversation("Rathbone? Just walk along this way and it'll be on the left.", [
        new ConversationResponse("Thanks!", "thanks",)
    ])],
    ["thanks", new Conversation("You're welcome!", [])],
    ["go", new Conversation("Goodbye!", [])],
])

export let martina_eminem_reference = new Map<string, Conversation>([
    ["start", new Conversation("I cannot believe they name a building after a rapper!", [], "Talk")]
]);
