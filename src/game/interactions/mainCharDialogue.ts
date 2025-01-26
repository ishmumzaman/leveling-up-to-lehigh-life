// Reviewed on 2024-10-02

import { Conversation, ConversationResponse } from "./conversation";

export let main_character_default = new Map<string, Conversation>([
    ["start", new Conversation("hi!", [])]
]);

export let main_character_dorm_cut_scene = new Map<string, Conversation>([
    ["stomachGrumble", new Conversation("*Stomach Grumbles Loudly of Hunger", [])]
]);

export let main_character_entrance = new Map<string, Conversation>([
    ["default", new Conversation("I should probably go order something at one of the checkout machines.", [])]
]);

export let main_character_hawks_nest = new Map<string, Conversation>([
    ["entrance", new Conversation("I should probably go order something at one of the checkout machines.", [])],
    ["ironicDialogue", new Conversation("oh wow that swipe animation was really something, these devs suck.", "machineInteractStart", "Talk", true)],
    ["machineInteractStart", new Conversation("50 MEAL SWIPES?! THAT'S 350 DOLLARS WORTH OF FOOD!!", "timeCheck")],
    ["timeCheck", new Conversation("AND THERES ONLY A WEEK LEFT!! WHAT AM I GONNA DO!?", "spendEverything")],
    ["spendEverything", new Conversation("OH MY GOD I NEED TO SPEND EVERYTHING NOW!!", [])]
]);

export let main_character_inven_full = new Map<string, Conversation>([
    ["default", new Conversation("Oh no, I can't carry anything else! I need to ask someone for help.", [])]
]);

export let main_character_done_shopping = new Map<string, Conversation>([
    ["default", new Conversation("Alright guys I think that will be all for today. Lets head out", [])]
]);

export let main_character_hawks_return = new Map<string, Conversation>([
    ["start", new Conversation("Yo welcome back dude, did you get my sna-", "shockedAtSnacks", "Talk", true)],
    ["shockedAtSnacks", new Conversation("OH MY GOD WHY DID YOU BUY SO MUCH FOOD?", [
        new ConversationResponse("I had 50 meal swipes and it's the last week", "50swipes")
    ])],
    ["50swipes", new Conversation("Wait, dude. How many swipes do you have now?", [
        new ConversationResponse("I have none left", "noSwipes")
    ])],
    ["noSwipes", new Conversation("Dude you realize we have 7 days left... What are you gonna eat??", [
        new ConversationResponse("Family swipe me in :D", "family"),
        new ConversationResponse("oh... I forgot about that.", "forgot")
    ])],
    ["family", new Conversation("I already used mine on my actual family. You're gonna have to find someone else with them", [
        new ConversationResponse("Yeah I'll probably do that. Thanks.", "someoneElse")
    ])],
    ["forgot", new Conversation("Yeah... You might wanna go and ask some other people with family swipes though I know no one spend them.", [
        new ConversationResponse("Yeah I'll probably do that. Thanks.", "someoneElse")
    ])],
    ["timeReallySlow", new Conversation("Also, I know you got a lot of snacks but what took you so long? It has been hours since you left...", [
        new ConversationResponse("I got your snack didn't I? I don't know why you're complaining...", "pay")
    ])],
    ["timeSlow", new Conversation("And I was wondering where you were. No wonder you took so long with that many snacks.", [
        new ConversationResponse("Yeah it was a struggle carrying it all.", "pay")
    ])],
    ["timeFast", new Conversation("Also dude how did you get so many snacks so fast??", [
        new ConversationResponse("I have my ways...", "pay")
    ])],
    ["timeInsanelyFast", new Conversation("There's no possible way you got all those snacks in this little amount of time... Are you cheating??", [
        new ConversationResponse("I'm just the goat what can I say", "pay")
    ])],
    ["pay", new Conversation("Alright anyways, here let me pay you for getting me the snack", [])]
]);