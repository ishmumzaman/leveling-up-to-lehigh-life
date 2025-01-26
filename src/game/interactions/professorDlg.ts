// Reviewed on 2024-10-02

import { Conversation, ConversationResponse } from "./conversation";

export let professor_first_time = new Map<string, Conversation>([
    ["start", new Conversation("Oh hey! Are you one of my students in the CompSci lab for ENGR050?", [
        new ConversationResponse("Yes, actually.", "yes"),
        new ConversationResponse("No, you must be mistaken.", "no"),
        new ConversationResponse("Yea, is that gray car yours?.", "car")
    ], "Talk")],
    ["car", new Conversation("Yes it's mine. I just got its window repaired after someone accidentally threw a rock at it.", [
        new ConversationResponse("Why would anyone do such things.", "anyway"),
        new ConversationResponse("Hm...'accidentally.'", "anyway")
    ], "Nod")],
    ["anyway", new Conversation("It was very unfortunate. Anyway, have you been attending to class regularly?", [
        new ConversationResponse("Oops...I have to go now.", "goodbye"),
        new ConversationResponse("I mean, I've been trying.", "work"),
        new ConversationResponse("Absolutely not.", "work")
    ], "Shake")],
    ["yes", new Conversation("Great! hmm... I haven't seen you in class lately. Are you keeping up with attendance?", [
        new ConversationResponse("Oops...I have to go now.", "goodbye"),
        new ConversationResponse("I mean, I've been trying.", "work"),
        new ConversationResponse("Absolutely not.", "work")
    ], "Nod",)],
    ["no", new Conversation("I'm pretty sure I saw you on the first day of class. Have you been coming to class lately?", [
        new ConversationResponse("Oh...I have to go now. Bye!", "goodbye"),
        new ConversationResponse("No, but I am confident in myself.", "laugh"),
        new ConversationResponse("Absolutely not.", "work")
    ], "Shake",)],
    ["work", new Conversation("Well, as long as you put in the work you should be fine.", [
        new ConversationResponse("Got it! I gotta run now.", "goodbye")
    ], "Talk",)],
    ["laugh", new Conversation("Haha, that's great to hear. I'm excited to see your final project", [
        new ConversationResponse("Definitely, I gotta run now.", "goodbye")
    ], "Nod",)],
    ["goodbye", new Conversation("Alright, but still try to attend class regularly, okay?", [], "Talk",)]
]);

export let professor_default = new Map([
    ["start", new Conversation("Hope to see you in class tomorrow!", [], "Talk")]
]);