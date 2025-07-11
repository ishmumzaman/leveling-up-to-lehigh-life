import { Conversation, ConversationResponse } from "./conversation";

// Default dialogue when Advisor is not part of a quest
export const advisor_default = new Map<string, Conversation>([
    ["start", new Conversation("Good day! I'm usually in this office between 9 and 5—feel free to stop by anytime.", [])]
]);

export const advisor_quest = new Map<string, Conversation>([
    ["start", new Conversation("Welcome in! I’ve been looking forward to meeting you face-to-face. How are you settling in overall?",[
        new ConversationResponse("It’s a lot to take in — I’m feeling overwhelmed.", "overwhelmed"),
        new ConversationResponse("I’m loving it so far!", "positive"),
        new ConversationResponse("I just wanted to say hi.", "justHi")
    ])],
    ["overwhelmed", new Conversation("College can be a whirlwind. Tell me what’s stressing you most — we have resources for time management, peer mentors, and counseling if you need it.",[
        new ConversationResponse("I could use some study strategies.", "studyTips"),
        new ConversationResponse("Maybe counseling?", "counseling")
    ])],
    ["positive", new Conversation("That’s fantastic! It’s great to hear you’re enjoying the start. Are there clubs or groups you’re curious about?",[
        new ConversationResponse("Yes, clubs for my major.", "majorsClubs"),
        new ConversationResponse("Not yet.", "end")
    ])],
    ["justHi", new Conversation("A warm greeting is perfect. Feel free to drop by anytime with questions, big or small.",[
        new ConversationResponse("Thanks, I will!", "end")
    ])],
    ["studyTips", new Conversation("Sure — I recommend setting up a weekly schedule with dedicated blocks for classes and study sessions. Use campus tutoring and join a study group — accountability helps.",[
        new ConversationResponse("Sounds great, thanks!", "end")
    ])],
    ["counseling", new Conversation("Counseling services are here for you, no judgement. I can give you the contact info or set up an appointment directly.",[
        new ConversationResponse("Please set it up.", "end")
    ])],
    ["majorsClubs", new Conversation("Absolutely — check out the Computer Science Club and the AI & Robotics Society. They often have drop-in events this week.",[
        new ConversationResponse("I’ll look into those.", "end")
    ])],
    ["end", new Conversation("Thanks for stopping by. My door is always open if you need guidance or just want to chat.",[])]
]);


