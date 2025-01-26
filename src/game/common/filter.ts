// Reviewed on 2024-09-18

import { FilterComponent } from "../../jetlag/Components/FilterComponent";
import { BlurFilter } from "pixi.js";
import { ColorOverlayFilter } from "pixi-filters";

/**
 * A color filter component, that applies a color overlay to the screen
 */
export class ColorFilter implements FilterComponent {
  private color_filter: ColorOverlayFilter; // The filter component

  /**
   * A constructor to make a color overlay filter
   * 
   * @param color   Color of the filter in hex
   * @param alpha   The "transparency" or how strong the color is [0.0 -- 1.0]
   * @param enabled A boolean for toggling this component
   */
  constructor(private color: number, private alpha: number, public enabled: boolean) {
    /** A color overlay filter, from the pixi filters */
    this.color_filter = new ColorOverlayFilter(this.color, this.alpha);
  }

  /** Return all the PIXI filters for this component */
  getFilters() { return [this.color_filter]; }

  /** Update the filter on each render step, and report if it's active */
  preRender(_elapsedMs: number) { return this.enabled; }
}

/**
 * The alarm filter component builds off the ColorOverlayFilter to create its
 * effect.
 *
 * [mfs]  Use 2-Math.cos() to get the oscillating effect in less code?
 */
export class AlarmFilter implements FilterComponent {
  private alarm_filter: ColorOverlayFilter;
  private alpha: number = 0;
  private increasing = true; // For tracking whether the filter is increasing in alpha or decreasing

  /**
   * A constructor to make an alarm filter
   * 
   * @param color   Color of the filter in hex
   * @param enabled A boolean for toggling this component
   */
  constructor(private color: number, public enabled: boolean) {
    /** A color overlay filter, from the pixi filters */
    this.alarm_filter = new ColorOverlayFilter(this.color, this.alpha);
  }

  /** Return all the PIXI filters for this component */
  getFilters() { return [this.alarm_filter]; }

  /** Update the filter on each render step, and report if it's active */
  preRender(elapsedMs: number) {
    // If the filter is enabled, for every render, it will
    // check what the alpha is and if it should be increasing or 
    // decreasing based off of that. 
    if (this.enabled) {
      if (this.alarm_filter.alpha >= 0.3) {
        this.increasing = false;
      }
      if (this.alarm_filter.alpha <= 0.09) {
        this.increasing = true;
      }
      if (this.increasing) {
        this.alarm_filter.alpha += elapsedMs / 7000;
      }
      else {
        this.alarm_filter.alpha -= elapsedMs / 7000;
      }
    }
    return this.enabled;
  }
}

/**
 * The fading blur filter creates a fade in 
 * or out blur effect to blur backgrounds when 
 * UI takes focus
 */
export class FadingBlurFilter implements FilterComponent {
  private blur_Filter: BlurFilter;
  // [mfs] "toggled" is a confusing name.  What does it mean?
  public toggled: boolean = false;

  /**
   * Create a fading blur filter
   *
   * @param strength  The strength of the blur
   * @param quality   The quality of the blur (This impacts performance.
   *                  Probably keep it 5 or below)
   * @param enabled   Is the filter active?
   */
  constructor(private strength: number, private quality: number, public enabled: boolean) {
    this.blur_Filter = new BlurFilter(this.strength, this.quality);
  }

  /**
   * get pixi.js filter components
   * 
   * @returns The Pixi filter components
   */
  public getFilters() { return [this.blur_Filter]; }

  public preRender(elapsedMs: number): boolean {
    // When the filter is enabled and toggled, slowly increase the blur until it reaches 15
    if (this.enabled) {
      if (this.toggled) {
        if (this.blur_Filter.blur < 15) {
          this.blur_Filter.blur += elapsedMs / 20;
        }
      }
      // When the filter is enabled and not toggled, slowly decrease the blur until it reaches 0
      else {
        if (this.blur_Filter.blur > 0) {
          this.blur_Filter.blur -= .5;
        }
        if (this.blur_Filter.blur <= 1) {
          this.enabled = false;
        }
      }
    }

    return this.enabled;
  }
}

export class FadeOutFilterComponent implements FilterComponent {
  /** A color overlay filter, from the pixi filters */
  private overlay_filter = new ColorOverlayFilter([0, 0, 0], 0);

  /** Return all the PIXI filters for this component */
  getFilters() { return [this.overlay_filter]; }

  /** a boolean for toggling this component */
  public enabled = true;

  /** Update the filter on each render step, and report if it's active */
  preRender(elapsedMs: number) {
    if (this.enabled) {
      this.overlay_filter.alpha += elapsedMs / 1500;
      if (this.overlay_filter.alpha > 1) {
        this.overlay_filter.alpha = 1;
      }
    }
    return this.enabled;
  }
}


/** A filter component for fading from black */
export class FadeInFilterComponent implements FilterComponent {
  /** A color overlay filter, from the pixi filters */
  private overlay_filter: ColorOverlayFilter;

  /** Return all the PIXI filters for this component */
  getFilters() { return [this.overlay_filter]; }

  /** Construct the FilterComponent */
  constructor() {
    this.overlay_filter = new ColorOverlayFilter(0x000000, 1);
    this.overlay_filter.enabled = true;
  }

  /** a boolean for toggling this component */
  public enabled = true;

  /** Update the filter on each render step, and report if it's active */
  preRender(elapsedMs: number) {
    if (this.enabled) {
      this.overlay_filter.alpha -= elapsedMs / 1500;
      if (this.overlay_filter.alpha < 0) {
        this.overlay_filter.alpha = 0;
        this.overlay_filter.enabled = false;
        this.enabled = false;
      }
    }
    return this.enabled;
  }
}