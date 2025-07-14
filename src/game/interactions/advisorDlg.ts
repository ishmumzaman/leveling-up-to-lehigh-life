import { Conversation, ConversationResponse } from "./conversation";

// Default dialogue when Advisor is not part of a quest
export const advisor_default = new Map<string, Conversation>([
    ["start", new Conversation("Good day! I'm usually in this office between 9 and 5, feel free to stop by anytime!", [])]
]);

export const advisor_quest = new Map<string, Conversation>([
    ["start", new Conversation("Welcome in! I have been looking forward to meeting you face to face. How are you settling in overall?",[
        new ConversationResponse("It is a lot to take in.", "overwhelmed"),
        new ConversationResponse("I am loving it so far!", "positive"),
        new ConversationResponse("I just wanted to say hi.", "justHi")
    ])],
    ["overwhelmed", new Conversation("College can be a whirlwind. Tell me what is stressing you most, we have resources for time management, peer mentors, and counseling if you need it.",[
        new ConversationResponse("I could use some study strategies.", "studyTips"),
        new ConversationResponse("Maybe counseling?", "counseling")
    ])],
    ["positive", new Conversation("That is fantastic! It is great to hear you are enjoying the start. Are there clubs or groups you are curious about?",[
        new ConversationResponse("Yes, clubs for my major.", "majorsClubs"),
        new ConversationResponse("Not yet.", "reset?"),
    ])],
    ["justHi", new Conversation("A warm greeting is perfect. Feel free to drop by anytime with questions, big or small.",[
        new ConversationResponse("Thanks, I will!", "reset?"),
    ])],
    ["studyTips", new Conversation("Sure! I recommend setting up a weekly schedule with dedicated blocks for classes and study sessions. Use campus tutoring and join a study group, accountability helps.",[
        new ConversationResponse("Sounds great, thanks!", "reset?")
    ])],
    ["counseling", new Conversation("Counseling services are here for you, no judgement. I can give you the contact info or set up an appointment directly.",[
        new ConversationResponse("Please set it up.", "reset?"),
    ])],
    ["majorsClubs", new Conversation("Absolutely, check out the ACM club and the AI club. They often have drop in events.",[
        new ConversationResponse("I will look into those.", "reset?"),
    ])],
    ["reset?", new Conversation("Would you like to talk about anything else?",[
        new ConversationResponse("Yes please!", "reask"),
        new ConversationResponse("Not really.", "end")
    ])],
    ["reask", new Conversation("What else would you like to talk about?",[
        new ConversationResponse("I feel overwhelmed", "overwhelmed"),
        new ConversationResponse("I am loving Lehigh so far!", "positive"),
        new ConversationResponse("I just wanted to say hi.", "justHi")
    ])],
    ["end", new Conversation("Thanks for stopping by. My door is always open if you need guidance or just want to chat.",[])]
]);


