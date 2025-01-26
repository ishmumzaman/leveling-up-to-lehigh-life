import { formatInTimeZone } from "date-fns-tz";
import {
  ImageSprite, TextSprite, VideoSprite, Actor,
  stage, BoxBody, CircleBody, MusicComponent,
  Path, PathMovement
} from "../../jetlag";
import { fmlBuilder } from "./fml";


export function splashBuilder(level: number) {
  // Takes click from user to allow video and audio playback
  if (level == 1) {
    new Actor({
      appearance: new TextSprite({ center: true, face: stage.config.textFont, color: "#000000", size: 24 }, "Press Me"),
      rigidBody: new BoxBody({ cx: 8, cy: 4.5, width: 16, height: 9 }),
      gestures: { tap: () => { stage.switchTo(splashBuilder, 2); return true; } }
    });
  }

  // Main menu
  else if (level == 2) {
    // Convert from system time zone to EST (Lehigh's time zone) and split into 4 distinct zones.
    let lehighTime: Date = new Date();
    let time = Math.floor(lehighTime.getHours() / 6);
    formatInTimeZone(lehighTime, 'America/New_York', 'MM-dd-yyyy HH:mm:ssXXX');
    // Create background to be initialized later based on time
    let a: Actor;

    // Based on what time it is, change the background
    switch (time) {
      case 0:
        a = new Actor({
          appearance: new VideoSprite({ width: 16, height: 9, vid: "mainMenu/Video/midnightLoop.mp4", z: -1 }),
          rigidBody: new CircleBody({ cx: 8, cy: 4.5, radius: .005 }),
        });
        break;
      case 1:
        a = new Actor({
          appearance: new VideoSprite({ width: 16, height: 9, vid: "mainMenu/Video/morningLoop.mp4", z: -1 }),
          rigidBody: new CircleBody({ cx: 8, cy: 4.5, radius: .005 }),
        });
        break;
      case 2:
        a = new Actor({
          appearance: new VideoSprite({ width: 16, height: 9, vid: "mainMenu/Video/afternoonLoop.mp4", z: -1 }),
          rigidBody: new CircleBody({ cx: 8, cy: 4.5, radius: .005 }),
        });
        break;
      case 3:
        a = new Actor({
          appearance: new VideoSprite({ width: 16, height: 9, vid: "mainMenu/Video/nightLoop.mp4", z: -1 }),
          rigidBody: new CircleBody({ cx: 8, cy: 4.5, radius: .005 }),
        });
        break;
      default: // This should never happen unless the time calculation is incorrect. Default to midnight loop.
        console.log("ERROR: INVALID TIME SELECTION");
        a = new Actor({
          appearance: new VideoSprite({ width: 16, height: 9, vid: "mainMenu/Video/midnightLoop.mp4", z: -1 }),
          rigidBody: new CircleBody({ cx: 8, cy: 4.5, radius: .005 }),
        });
    }
    // When the video ends, if the time is in the same zone, reset the same video
    (a.appearance[0] as VideoSprite).onEnd(() => {
      if (time == Math.floor(lehighTime.getHours() / 6)) {
        (a.appearance[0] as VideoSprite).reset();
        (a.appearance[0] as VideoSprite).play();
      }
      // Otherwise if the time zone has switched, determine what time and video to play
      else {
        switch (time) {
          case 0:
            a = new Actor({
              appearance: new VideoSprite({ width: 16, height: 9, vid: "mainMenu/Video/midnightLoop.mp4", z: -1 }),
              rigidBody: new CircleBody({ cx: 8, cy: 4.5, radius: .005 }),
            });
            break;
          case 1:
            a = new Actor({
              appearance: new VideoSprite({ width: 16, height: 9, vid: "mainMenu/Video/morningLoop.mp4", z: -1 }),
              rigidBody: new CircleBody({ cx: 8, cy: 4.5, radius: .005 }),
            });
            break;
          case 2:
            a = new Actor({
              appearance: new VideoSprite({ width: 16, height: 9, vid: "mainMenu/Video/afternoonLoop.mp4", z: -1 }),
              rigidBody: new CircleBody({ cx: 8, cy: 4.5, radius: .005 }),
            });
            break;
          case 3:
            a = new Actor({
              appearance: new VideoSprite({ width: 16, height: 9, vid: "mainMenu/Video/nightLoop.mp4", z: -1 }),
              rigidBody: new CircleBody({ cx: 8, cy: 4.5, radius: .005 }),
            });
            break;
          default:
            console.log("ERROR: INVALID TIME SELECTION");
            a = new Actor({
              appearance: new VideoSprite({ width: 16, height: 9, vid: "mainMenu/Video/midnightLoop.mp4", z: -1 }),
              rigidBody: new CircleBody({ cx: 8, cy: 4.5, radius: .005 }),
            });
            (a.appearance[0] as VideoSprite).reset();
            (a.appearance[0] as VideoSprite).play();
        }
      }
    });

    // Draw Lehigh logo and have it animate in from the top
    new Actor({
      appearance: new ImageSprite({ width: 5, height: 4.5, img: "mainMenu/Images/logo.png" }),
      rigidBody: new BoxBody({ cx: 8, cy: -1, width: 12.8, height: 3 }),
      movement: new PathMovement(new Path().to(8, -1).to(8, 2.5), 4, false)
    });

    // Create the three buttons
    new Actor({
      appearance: new ImageSprite({ width: 2.5, height: 1, img: "mainMenu/Images/menuButton.png" }),
      rigidBody: new BoxBody({ cx: 8, cy: 5.5, width: 2.5, height: 1 }),
    });
    new Actor({
      appearance: new ImageSprite({ width: 2.5, height: 1, img: "mainMenu/Images/menuButton.png" }),
      rigidBody: new BoxBody({ cx: 8, cy: 6.7, width: 2.5, height: 1 }),
    });
    new Actor({
      appearance: new ImageSprite({ width: 2.5, height: 1, img: "mainMenu/Images/menuButton.png" }),
      rigidBody: new BoxBody({ cx: 8, cy: 7.9, width: 2.5, height: 1 }),
    });

    new Actor({
      appearance: new TextSprite({ center: true, face: "Jersey 15", size: 60, color: "#653600" }, "PLAY"),
      rigidBody: new BoxBody({ cx: 8, cy: 5.45, width: 2.5, height: 1.25 }),
      gestures: { tap: () => { stage.switchTo(fmlBuilder, 1); return true; } }
    });

    new Actor({
      appearance: new TextSprite({ center: true, face: "Jersey 15", size: 60, color: "#653600" }, "HELP"),
      rigidBody: new BoxBody({ cx: 8, cy: 6.65, width: 2.5, height: 1.25 }),
      /*gestures: { tap: () => { stage.switchTo(chooserBuilder, 1); return true; } }*/
    });

    new Actor({
      appearance: new TextSprite({ center: true, face: "Jersey 15", size: 60, color: "#653600" }, "QUIT"),
      rigidBody: new BoxBody({ cx: 8, cy: 7.85, width: 2.5, height: 1.25 }),
      /*gestures: { tap: () => { stage.switchTo(chooserBuilder, 1); return true; } }*/
    });




    /* For music implementation
    if (stage.gameMusic === undefined)
        stage.gameMusic = new MusicComponent(stage.musicLibrary.getMusic("tune2.ogg"));
      stage.gameMusic.play();
      
    */



  }
}
