import { Conversation, ConversationResponse } from "./conversation";

export let roommate_first_time = new Map<string, Conversation>([
  ["start", new Conversation("Oh... hi. Sorry to bother you, but I locked myself out.", [
    new ConversationResponse("Oh no! Need some help?", "offer_help"),
    new ConversationResponse("Rough day, huh? Good luck with that.", "goodbye")
  ], "Talk")],

  ["offer_help", new Conversation("Yeah… if you don’t mind. I’ve been out here for a while.", [
    new ConversationResponse("It's a weekday between 7 AM & 5 PM... we have to go to the IDEAL office. Want me to walk you there?", "ideal_walk"),
    new ConversationResponse("It's a weekday between 5 PM & 8 PM... we should call LUPD. Their number is (610) 758-4200 — I can call if that's easier.", "call_lupd"),
    new ConversationResponse("It’s after 8 PM on a weekday (or anytime on the weekend). We should call the Gryphon on Duty. You saw the sign on the Gryphon's door with the clothespin and the phone number, right?", "call_ra")
  ], "Nod")],

  // IDEAL Office 
  ["ideal_walk", new Conversation("Yeah, walking over would be awesome. Thanks for offering to come with me.", [
    new ConversationResponse("No problem, let’s head over together.", "goodbye_ideal")
  ], "Talk")],

  // Calling LUPD 
  ["call_lupd", new Conversation("Calling LUPD sounds like the move. I’d appreciate it if you could make the call.", [
    new ConversationResponse("You got it, I’ll give them a ring.", "lupd_arrival")
  ], "Talk")],

  ["lupd_arrival", new Conversation("LUPD Officer: Hey there, you called about a lockout? I can get you back in.", [
    new ConversationResponse("Yep! Thanks for coming out.", "lupd_unlock")
  ], "Talk")],

  ["lupd_unlock", new Conversation("LUPD Officer: Alright, here you go — you're all set. Try not to get locked out again!", [
    new ConversationResponse("Will do! Thanks again.", "goodbye_lupd")
  ], "Nod")],

  // Calling Gryphon 
  ["call_ra", new Conversation("Yeah… calling the Gryphon would be really helpful. Thanks for offering.", [
    new ConversationResponse("No problem, I’ll give them a call.", "gryphon_arrival")
  ], "Talk")],

  ["gryphon_arrival", new Conversation("Gryphon on Duty: Hey, heard you’re locked out. I’ll grab the spare key for you.", [
    new ConversationResponse("Thank you so much!", "gryphon_unlock")
  ], "Talk")],

  ["gryphon_unlock", new Conversation("Gryphon on Duty: Here’s the key! Let’s get you back inside. Make sure you lock up behind you.", [
    new ConversationResponse("Absolutely. Thanks again!", "goodbye_ra")
  ], "Nod")],

  // Endings
  ["goodbye_ideal", new Conversation("Thanks again for walking with me. I owe you one!", [], "Nod")],
  ["goodbye_lupd", new Conversation("Thanks again. Hopefully they show up soon and I can get back inside.", [], "Talk")],
  ["goodbye_ra", new Conversation("Thanks again. Hopefully the Gryphon isn’t too annoyed about another lockout.", [], "Talk")],
  ["goodbye", new Conversation("Yeah… thanks anyway. Hopefully someone shows up soon.", [], "Talk")]
]);
