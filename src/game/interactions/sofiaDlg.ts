import { Conversation, ConversationResponse } from "./conversation";

// Default dialogue when Sofia is not part of a quest
export const sofia_default = new Map<string, Conversation>([
    ["start", new Conversation("Hey! Nice day for a stroll across campus, right?",[])]
  ]);
  
// Dialogue when the FindAdvisor quest begins (Objective 0)
export const sofia_questStart = new Map<string, Conversation>([
    ["start", new Conversation("Hey there! I just left my advisors office. Honestly, it was one of the best chats I had.", [
        new ConversationResponse("Really? How was it?", "details"),
        new ConversationResponse("I am kind of nervous...", "reassure")
    ])],
    ["details", new Conversation("We talked about classes, but he also asked about how I am adjusting personally. He recommended a study group and some mindfulness workshops!", [
        new ConversationResponse("That sounds helpful!", "end")
    ])],
    ["reassure", new Conversation("Totally normal! I felt the same. But he was super supportive, even shared tips on managing stress during midterms.", [
        new ConversationResponse("Okay, I will give it a shot.", "end")
    ])],
    ["end", new Conversation("Trust me, you will walk out feeling lighter. Go on, you got this!", [])],
]);

// Dialogue after completing the advisor check-in (Objective 2 completed)
export const sofia_postAdvisor = new Map<string, Conversation>([
    ["start", new Conversation("Hey there! I saw you coming out of the advisor's office, how did it go?", [
        new ConversationResponse("It was super helpful!", "positive"),
        new ConversationResponse("I have more questions than before.", "followup")
    ])],
    ["positive", new Conversation("That's fantastic! Advisors are really great to learn about support resources.", [ 
        new ConversationResponse("I feel so much more confident.", "end") 
    ])],
    ["followup", new Conversation("Don't worry, that's totally normal. You can always drop by again or send an email anytime.", [ 
        new ConversationResponse("I will do that. Thanks!", "end") 
    ])],
    ["end", new Conversation("Glad to hear. Let me know if you need a study buddy or just want to chat again.", [])]
]);