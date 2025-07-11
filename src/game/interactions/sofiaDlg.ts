import { Conversation, ConversationResponse } from "./conversation";

// Default dialogue when Sofia is not part of a quest
export const sofia_default = new Map<string, Conversation>([
    ["start", new Conversation("Hey! Nice day for a stroll across campus, right?",[])]
  ]);
  
// Dialogue when the FindAdvisor quest begins (Objective 0)
export const sofia_questStart = new Map<string, Conversation>([
    ["start", new Conversation("Hey there! I just left my advisor’s office — honestly, it was one of the best chats I’ve had here so far.", [
        new ConversationResponse("Really? How was it?", "details"),
        new ConversationResponse("I’m kind of nervous...", "reassure")
    ])],
    ["details", new Conversation("We talked about classes, but she also asked about how I’m adjusting personally. She recommended a study group and some mindfulness workshops — stuff I’d never considered.", [
        new ConversationResponse("That sounds helpful!", "end")
    ])],
    ["reassure", new Conversation("Totally normal! I felt the same. But she was super supportive — even shared tips on managing stress during midterms.", [
        new ConversationResponse("Okay, I’ll give it a shot.", "end")
    ])],
    ["end", new Conversation("Trust me, you’ll walk out feeling lighter. Go on, you’ve got this!", [])],
]);

// Dialogue after completing the advisor check-in (Objective 2 completed)
export const sofia_postAdvisor = new Map<string, Conversation>([
    ["start", new Conversation("Hey there! I saw you coming out of the advisor's office — how did it go?", [
        new ConversationResponse("It was super helpful — I learned about study groups and support resources.", "positive"),
        new ConversationResponse("I have more questions now than before.", "followup")
    ])],
    ["positive", new Conversation("That's fantastic! Advisors really care about you as a person, not just your schedule.", [ 
        new ConversationResponse("I feel so much more confident.", "end") 
    ])],
    ["followup", new Conversation("Don't worry — that's totally normal. You can always drop by again or send an email anytime.", [ 
        new ConversationResponse("I'll do that. Thanks!", "end") 
    ])],
    ["end", new Conversation("Glad to hear. Let me know if you need a study buddy or just want to chat again.", [])]
]);