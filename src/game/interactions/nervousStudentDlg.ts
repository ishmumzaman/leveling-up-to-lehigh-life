import { Conversation, ConversationResponse } from "./conversation";

export const nervousStudent_default = new Map<string, Conversation>([
    ["start", new Conversation("I heard the advisor’s been really helpful—maybe I’ll try going in sometime.", [])]
]);
  
export const nervousStudent_quest = new Map<string, Conversation>([
    ["start", new Conversation("Hey... I wanted to go in but I’m second-guessing myself. What if I sound silly?",[
        new ConversationResponse("No one judges — you’ll just say hi and learn stuff.", "reassure"),
        new ConversationResponse("Maybe we should just head back.", "back")
    ])],
    ["reassure", new Conversation("You’re right. Thanks. I’ll go in. Wish me luck!",[])],
    ["back", new Conversation("Come on, you’ll regret not trying. Let’s go together.",[])]
]);
