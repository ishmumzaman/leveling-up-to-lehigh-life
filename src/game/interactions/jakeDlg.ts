// Reviewed on 2024-10-02

import { Conversation, ConversationResponse } from "./conversation";

export let jake_default = new Map<string, Conversation>([
    ["start", new Conversation("Yo what's up dude.", [])]
]);

export let jake_ask_direction = new Map<string, Conversation>([
    ["start", new Conversation("Hey, do you know where the Rathbone building is?", [
        new ConversationResponse("Let me go ask someone", "dontKnow")
    ])],
    ["dontKnow", new Conversation("Okay I am really looking forward to trying the infamous dry turkey breasts.", [])]
])

export let jake_waiting_direction = new Map<string, Conversation>([
    ["start", new Conversation("Have you found out where Rathbone is?", [
        new ConversationResponse("Not yet", "notYet"),
    ])],
    ["notYet", new Conversation("Shucks, I still want to try those dry turkey breasts. Let me know if you find out.", [])]
])

export let give_jake_direction = new Map<string, Conversation>([
    ["start", new Conversation("Have you found out where Rathbone is?", [
        new ConversationResponse("Yes, it's this way...", "yes", 2),
        new ConversationResponse("Not yet", "notYet"),
    ])],
    ["yes", new Conversation("Oh right, it's in UpperCent. Thank you for helping me out.", [
        new ConversationResponse("No problem!", "noProb")
    ])],
    ["notYet", new Conversation("Shucks, I still want to try those dry turkey breasts. Let me know if you find out.", [])],
    ["noProb", new Conversation("I'm gonna go try the dry turkey breasts now, see you later!", [])]
])

export let jake_has_direction = new Map<string, Conversation>([
    ["start", new Conversation("I'm so excited to try Rathbone food", [])],
])

export let jake_dorm_cut_scene = new Map<string, Conversation>([
    ["start", new Conversation("You need some food in your system dude, what was that?", [
        new ConversationResponse("Wanna go to Rathbone together?", "rathbone"),
        new ConversationResponse("Yeah, I'm gonna go to Hawk's Nest.", "hawks"),
        new ConversationResponse("Yeah, I might order delivery", "delivery")
    ])],
    ["rathbone", new Conversation("Nah dude I just ate recently. Probably not right now.", [
        new ConversationResponse("Alright I'll head to Hawk's then", "hawks")
    ], "Shake")],
    ["hawks", new Conversation("I don't know how you still have the meal swipes for that. I'm almost out completely.", [
        new ConversationResponse("Alright cya!", "goodbye")
    ])],
    ["delivery", new Conversation("Bro you do not have the money for that. Be for real.", [
        new ConversationResponse("You're right. I'll head to Hawk's", "hawks")
    ])],
    ["goodbye", new Conversation("Aight peace out bro. Get me a snack on your way back will ya?", [])]
]);

export let jake_hawks_return = new Map<string, Conversation>([
    ["start", new Conversation("Yo welcome back dude, did you get my sna-", "shockedAtSnacks", "Talk", true)],
    ["shockedAtSnacks", new Conversation("OH MY GOD WHY DID YOU BUY SO MUCH FOOD?", [
        new ConversationResponse("I had 50 swipes, it's the last week", "50swipes")
    ])],
    ["50swipes", new Conversation("Wait, dude. How many swipes do you have now?", [
        new ConversationResponse("I have none left", "noSwipes")
    ])],
    ["noSwipes", new Conversation("Dude you realize we have 7 days left... What are you gonna eat??", [
        new ConversationResponse("Family swipe me in :D", "family"),
        new ConversationResponse("oh... I forgot about that.", "forgot")
    ]
    )],
    ["family", new Conversation("I already used mine on my actual family. You're gonna have to find someone else with them", [
        new ConversationResponse("Yeah I'll probably do that. Thanks.", "someoneElse")
    ])],
    ["forgot", new Conversation("Yeah... You might wanna go and ask some other people with family swipes though I know no one spend them.", [
        new ConversationResponse("Yeah I'll probably do that. Thanks.", "someoneElse")
    ])],
    ["someoneElse", new Conversation("Well anyways,", [])],
    ["timeReallySlow", new Conversation("Also, I know you got a lot of snacks but what took you so long? It has been hours since you left...", [
        new ConversationResponse("I like to take my time", "pay")
    ])],
    ["timeSlow", new Conversation("And I was wondering where you were. No wonder you took so long with that many snacks.", [
        new ConversationResponse("Yeah it was a struggle carrying it all.", "pay")
    ])],
    ["timeFast", new Conversation("Also dude how did you get so many snacks so fast??", [
        new ConversationResponse("I have my ways...", "pay")
    ])],
    ["timeReallyFast", new Conversation("There's no possible way you got all those snacks in this little amount of time... Are you cheating??", [
        new ConversationResponse("I'm just the goat what can I say", "pay")
    ])],
    ["pay", new Conversation("Alright anyways, here let me pay you for getting me that snack.", [])]
]);