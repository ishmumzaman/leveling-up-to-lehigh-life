import { Conversation, ConversationResponse } from "./conversation";

export const nervousStudent_default = new Map<string, Conversation>([
    ["start", new Conversation("I heard the advisor has been really helpful, maybe I will try going in sometime.", [])]
]);
  
export const nervousStudent_quest = new Map<string, Conversation>([
    ["start", new Conversation("Hey... I wanted to go in but I am second guessing myself. What if I sound silly?",[
        new ConversationResponse("Do not worry!", "reassure"),
        new ConversationResponse("Maybe we should just head back.", "back")
    ])],
    ["reassure", new Conversation("You are right, I shouldn't worry too much. I will go in. Wish me luck!",[])],
    ["back", new Conversation("Come on, you will regret not trying. We will go in together bro!",[])]
]);
