import { Actor, AnimatedSprite, BoxBody, FilledBox, ImageSprite, ManualMovement, Scene, SpriteLocation, stage, TextSprite, TimedEvent } from "../../jetlag";
import { SessionInfo } from "../storage/session";
import { CharacterAnimations, CharacterConfig } from "../characters/characterCustomization";
import { openingScreenBuilder } from "../introScene/OpeningScreenBuilder";
import { FadingBlurFilter } from "../common/filter";

// NOTE: There is a strange waiting time before the game initially
// loads when more than 1 person is on multiplayer. Not sure why.
// If you wait on the black screen it WILL eventually load.

// 

/**
 * This interface allows us to require level builders
 * to need playerLimits and builderNames as to be used
 * in the stage.ts file.
 * @param playerLimit The maximum amount of players to be allowed in a certain level
 * @param builderName The name of the builder without the "builder" part to be used as a room name
 */
export interface Builder {
  (_level: number): void;
  playerLimit: number;
  builderName: string;
}

/**
 * The RemoteActor type is just a way of bundling together several pieces of
 * information that we need to track in order to know how to use a remote user's
 * network messages to move their actor on our screen.
 */
export class RemoteActor {
  /**
   * Construct a RemoteActor object
   *
   * @param userId    The id of the user
   * @param userName  The name of the user
   * @param actor     The Actor object in the game that is controlled by userId
   * @param animation The character config object representing the actor's current character's outfit
   */
  constructor(public userId: string, public userName: string, public actor: Actor, public animation: CharacterConfig | undefined = undefined) { }
}

/**
 * A network packet with all movement information 
 * to be sent repeatedly whenever a user joins a room.
 * Triggered within character.ts
 */
export class movementPacket {
  /**
   * Construct an movementPacket object
   *
   * @param userId The Id of the user moving
   * @param cx     The center X for userId's Actor
   * @param cy     The center Y for userId's Actor
   * @param velX   The horizontal velocity of the user's actor
   * @param velY   The vertical velocity of the user's actor
   */
  constructor(public userId: string, public cx: number, public cy: number, public velX: number, public velY: number) { }
}

/**
 * A network packet with all outfit information 
 * to be sent whenever a user joins a room or
 * whenever an outfit is changed from an inventory
 */
export class outfitChangePacket {
  /**
   * Construct an outfitChangePacket object
   *
   * @param userId The Id of the user moving
   * @param animation configuration of user character to create animations
   */
  constructor(public userId: string, public animation: CharacterConfig) { }
}

/**
 * Make an "empty" actor to represent a remote actor and return it
 * to be assigned to a specific user. This user will be assigned a 
 * transparent texture icon as it will be manually assigned later on.
 * This actor's movement will be controlled by the server.
*/
function makeRemoteActor() {
  return new Actor({
    appearance: new ImageSprite({ width: .8, height: 1.6, img: "empty.png" }), // Need to debug? use "missingMPChar.png"
    rigidBody: new BoxBody({ cx: -1, cy: -1, width: .5, height: .5 }, { dynamic: true, collisionsEnabled: false }),
    movement: new ManualMovement()
  });
}

/**
 * Connect the current user to a server, then set up the actor for this user
 * once they're connected.
 *
 * @param userId     The Id to use for the new user
 * @param userName   The name to use for the new user
 */
export function connectUser(userId: string, userName: string) {
  // If we've already called this and it didn't fail, then don't try to connect
  // again
  if (!stage.storage.getSession("sStore")) { stage.storage.setSession("sStore", new SessionInfo()) };
  let sStore = stage.storage.getSession("sStore") as SessionInfo;

  // Whenever there is a server or connection error, create an error message and
  // give the user the option to report the issue to us and refresh the page.
  let fatalError = (msg: string) => {
    // Create an overlay to pause all game functions
    stage.requestOverlay((overlay: Scene, screenshot: ImageSprite | undefined) => {

      let fadeFilter = new FadingBlurFilter(0, 5, false);

      // Draw background screenshot
      new Actor({ appearance: screenshot!, rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 16, height: 9 }, { scene: overlay }), });

      // Create the error box and text associated with it
      new Actor({
        appearance: [new ImageSprite({ width: 12, height: 6, img: "fatalError.png", z: 1 }),
        new TextSprite({ center: true, face: "Helvetica", color: "#cc0000", size: 30, offset: { dx: 0, dy: -2.3 }, z: 1 }, "Fatal Error"),
        new TextSprite({ center: true, face: "Helvetica", color: "#000000", size: 45, offset: { dx: 0.1, dy: 0 }, z: 1 }, "A fatal error has occurred. \nPlease report the issue to a \ndeveloper and then refresh the page. \nView the advanced error by clicking \nthe icon in the top right corner."),
        new TextSprite({ center: true, face: "Helvetica", color: "#000000", size: 40, offset: { dx: -2.52, dy: 2.5 }, z: 1 }, "Report"),
        new TextSprite({ center: true, face: "Helvetica", color: "#000000", size: 40, offset: { dx: 2.52, dy: 2.5 }, z: 1 }, "Refresh")
        ],
        rigidBody: new BoxBody({ width: 12, height: 6, cx: 8, cy: 4.5 }, { scene: overlay })
      })

      // Create the tap to reload button
      new Actor({
        appearance: new FilledBox({ width: 0, height: 0, fillColor: "#000000", z: 1 }),
        rigidBody: new BoxBody({ width: 4, height: 1.5, cx: 10.5, cy: 7 }, { scene: overlay }),
        gestures: {
          tap: () => {
            location.reload(); // refresh the browser window
            return true;
          }
        },
      });

      // Create the contact the developers button
      // TODO: Create a bug reporting form
      new Actor({
        appearance: new FilledBox({ width: 0, height: 0, fillColor: "#000000", z: 1 }),
        rigidBody: new BoxBody({ width: 4, height: 1.5, cx: 5.5, cy: 7 }, { scene: overlay }),
        gestures: {
          tap: () => {
            window.open("https://github.com/YassCoding/LUTLL");
            return true;
          }
        },
      });

      // Create info icon in top right to show the actual error message.
      // TODO: Fix this so that it shows ALL error messages, not just the latest one
      new Actor({
        appearance: new ImageSprite({ width: 1, height: 1, img: "advancedErrorInfo.png", z: 1 }),
        rigidBody: new BoxBody({ width: 1, height: 1 + Math.random() * 2, cx: 15, cy: 1 }, { scene: overlay }),
        gestures: {
          tap: () => {
            window.alert(msg);
            return true;
          }
        },
      });

      // Enable the blur filter we created earlier on the screenshot we created
      stage.renderer.addZFilter(fadeFilter, -2, SpriteLocation.OVERLAY);
      fadeFilter.enabled = true;
      fadeFilter.toggled = true;
    }, true)

    // TODO: Consider booting the user the offline instead of disconnecting them
    stage.network.doDisconnect();
    stage.network.reset();
  }

  // Set all of our error and disconnect events to show an error message and stop the game.
  stage.network.evtDisconnected = fatalError;
  stage.network.resErrHasUser = fatalError;
  stage.network.resErrNoUser = fatalError;
  stage.network.resErrHasRoom = fatalError;
  stage.network.resErrNoRoom = fatalError;
  stage.network.resErrFormat = fatalError;
  stage.network.resLoggedOut = fatalError;
  stage.network.resErrUserTaken = fatalError;

  // Before we can connect, we have to set up the handlers for the various
  // network events

  stage.network.evtConnected = () => {
    // remember that we're connected, and try to log in
    sStore.loginInfo.connected = true;
    stage.network.doReqLoginToken(userId, userName);
  };

  stage.network.resLoggedIn = () => {
    // We're logged in.  First, save this user's info to sStore.loginInfo
    sStore.loginInfo.userId = userId;
    sStore.loginInfo.userName = userName;

    stage.network.doReqCreate("LoggingIn");
  };

  // This is needed as we need to be in a room before switchTo can automatically
  // reqSwitch or reqLeave from it.
  stage.network.resCreated = (msg: string) => {
    // save room builder and id from resCreated message
    let m = JSON.parse(msg).roomInfo;
    sStore.loginInfo.room.id = m.id;
    sStore.loginInfo.room.builder = m.builder

    // now switch to the 2nd level of the login builder so
    // we can switch to the actual game level
    stage.switchTo(openingScreenBuilder, 1);
  };

  stage.network.evtUserJoined = (msg: string) => {
    // When a remote user joins a room, add it to the remote actors list, and
    // set up an Actor for it in the world.
    let m = JSON.parse(msg);
    sStore.loginInfo.remoteActors.set(m.userId, new RemoteActor(m.userId, userName, makeRemoteActor()));

    // This gives the server the joined user's outfit information
    stage.network.doOutfitChange(JSON.stringify(new outfitChangePacket(sStore.loginInfo.userId, sStore.playerAppearance!.config)))
  };

  stage.network.evtUserLeft = (msg: string) => {
    // When a remote user exits the room, take them out of the world and remote
    // actor list
    let m = JSON.parse(msg);
    if (sStore.loginInfo.remoteActors.has(m.userId)) {
      sStore.loginInfo.remoteActors.get(m.userId)!.actor.enabled = false;
      sStore.loginInfo.remoteActors.delete(m.userId);
    }
  };

  stage.network.broadcast = (msg: string) => {
    // This serves as an example for any future events.
    // Also see multiplayer-server/workflow,types and jetlag/Devices/Network
  };

  // TODO: Fix hitch that happens on outfitChange
  stage.network.outfitChange = (msg: string) => { 
    // When a remote user sends a state update, handle it
    let m = JSON.parse(msg).msg;
    let packet = JSON.parse(m) as outfitChangePacket;
    let a = sStore.loginInfo.remoteActors.get(packet.userId) as RemoteActor; // Find the user's Actor who's outfit is changing
    if (!a) return; 

    // Create animations based on packet and create appearance object with the animations
    let newAni = new CharacterAnimations(packet.animation);
    let app = new AnimatedSprite({ width: 0.8, height: 1.6, animations: newAni.animations, remap: newAni.remap, offset: { dx: 0, dy: -0.6 }, z: 2 });

    // Give the specified Actor the animations
    app.actor = a.actor;
    a.actor.appearance[0] = app;
    a.animation = packet.animation;
  }

  stage.network.move = (msg: string) => {
    // When a remote user sends a state update, handle it 
    let m = JSON.parse(msg).msg;
    let packet = JSON.parse(m) as movementPacket;
    let a = sStore.loginInfo.remoteActors.get(packet.userId) as RemoteActor;
    if (!a) return;

    // TODO: Research and implement server-client latency prediction and compensation 
    // Check for desync and adjust if so
    // This is not perfect and results in a slight rubber banding effect on bad network conditions
    if (a.actor.rigidBody.getCenter().x != packet.cx || a.actor.rigidBody.getCenter().y != packet.cy) {
      a.actor.rigidBody.setCenter(packet.cx, packet.cy);
    }

    // We use velocity to show animations when remote actors move
    (a.actor.movement as ManualMovement).setAbsoluteVelocity(packet.velX, packet.velY)
  }

  stage.network.resSent = () => {
    // We don't bother announcing when a broadcast succeeds
    // We might want to have some code run in the future
  };

  stage.network.resJoined = (msg: string) => {
    let m = JSON.parse(msg);
    sStore.loginInfo.room.builder = m.roomInfo.builder;
    sStore.loginInfo.room.id = m.roomInfo.id;

    // When joining an existing room, be sure to add all users and oneself
    for (let p of m.peers)
      sStore.loginInfo.remoteActors.set(p.id, new RemoteActor(p.id, p.name, makeRemoteActor()));
  };

  // TODO: hook this up to a permanently hosted server
  // We use a set IP here but this might change in the future
  stage.network.connect("http://128.180.209.152:3000"); // CHANGE ME
}

// TODO: make loadingBuilder based on server responses or not necessary please

// This gives the server time to catch up before loading so the switchTo
// function in stage.ts can automatically switch rooms and builders.
// This is only done on startup
export function loadingBuilder(level: number, builderName: string, builder: (level: number) => void) {
  if (!(stage.storage.getSession("sStore") as SessionInfo).loginInfo.connected) { builder(level); return;};
  let sStore = (stage.storage.getSession("sStore") as SessionInfo);

  if (sStore.loginInfo?.connected) {
    // checks every frame to see if the server and client are caught up
    let event = new TimedEvent(.01, true, () => { 
      if (builderName == sStore.loginInfo?.room.builder) {
        builder(level);
        event.cancelled = true;
      }
    })

    stage.world.timer.addEvent(event);
  }
}

// TODO: Make this look prettier to end-user :)
export const loginBuilder: Builder = function (level: number) {
  loadingBuilder(level, loginBuilder.builderName + level, () => {
    if (level == 1) {
      if (!stage.storage.getSession("sStore")) { stage.storage.setSession("sStore", new SessionInfo()) };
      let sStore = stage.storage.getSession("sStore") as SessionInfo;
      let loginText = "Log in."
      new Actor({
        appearance: new TextSprite({ center: true, face: "Arial", size: 48, color: "#000000" }, () => loginText),
        rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 4.5, height: 1 }, { scene: stage.hud }),
        gestures: {
          tap: () => {
            sStore.multiplayerMode = true;
            // TODO: Does this input need to be sanitized? DO NOT USE IN FINAL BUILDS
            let username = window.prompt("What is your username?", "buh"+Math.floor(Math.random()*10000)) || "buh"+Math.floor(Math.random()*10000);

            // Prevents crash on user pressing cancel/esc
            if (!username){
              username = "buh"+Math.floor(Math.random()*10000);
            }

            let id = username;
            loginText = "Logging in..."

            // This makes sure everything is loaded
            // TODO: Change this to work with server responses instead of a fixed timer
            // BUG: If a user's connection is slow, .1 seconds is not enough
            stage.world.timer.addEvent(new TimedEvent(.01, false, () => { 
              connectUser(username, id);
            }))

            return true;
          }
        }
      });

      // Play offline button
      new Actor({
        appearance: new TextSprite({ center: true, face: "Arial", size: 32, color: "#000000" }, () => "Play offline!"),
        rigidBody: new BoxBody({ cx: 8, cy: 7, width: 4.5, height: 1 }, { scene: stage.hud }),
        gestures: {
          tap: () => {
            stage.switchTo(openingScreenBuilder, 1);
            return true;
          }
        }
      });
    }

    // TODO: Prettify please :)
    // Loading screen in case user connection is slow or timer is increased in level one
    if (level == 2) {
      new Actor({
        appearance: new TextSprite({ center: true, face: "Arial", size: 48, color: "#000000" }, () => "Loading Player..."),
        rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 4.5, height: 1 }, { scene: stage.hud }),
      });
      stage.world.timer.addEvent(new TimedEvent(.01, false, () => {
        stage.switchTo(openingScreenBuilder, 1);
      }))
    }
  })
}

loginBuilder.builderName = "loginBuilder"
loginBuilder.playerLimit = 1;

