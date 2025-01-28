import { Actor, BoxBody, stage, TextSprite } from "../../jetlag";
import { Config } from '../game';
/**
 * Singleton class that manages time passage
 */
export class WorldClock {
    day: number = 0;
    inBed: boolean = false;
    minute: number = 0;
    hour: number = 0;
    minuteRate = (stage.config as Config).minuteRate;

    /** 
     * Date and time display
     */
    drawClock() {
        let clock = new Actor({
            appearance: [
                new TextSprite({ center: true, face: stage.config.textFont, color: "000000", size: 12, strokeColor: "00000000", strokeWidth: 5 },
                    () => `${this.hour < 10 ? "0" + this.hour : this.hour} : ${this.minute < 10 ? "0" + this.minute : this.minute}`),
                new TextSprite({ center: true, face: stage.config.textFont, color: "000000", size: 12, strokeColor: "00000000", strokeWidth: 5, offset: { dx: 0, dy: 2 } },
                    () => "Day: " + this.day),
            ],
            rigidBody: new BoxBody({ cx: 12.8, cy: 3.5, width: 0.1, height: 0.1 }, { scene: stage.hud }),
        });
        return clock;
    }
}