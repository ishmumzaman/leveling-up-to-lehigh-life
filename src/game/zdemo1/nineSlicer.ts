// Corners stay the same
// mids get stretched out

import { AppearanceComponent, ImageSprite } from "../../jetlag";
import "../../../assets/9Sprites/woodOutline.json";

// Define the structure of your JSON data
// interface SourceSize {
//   w: string;
//   h: string;
// }

// interface ImageDimensions {
//   [key: string]: {
//     sourceSize: SourceSize;
//   };
// }

export function nineSlicer(image: string, width: number, height: number) {
  let appearanceList: AppearanceComponent[] = [];
  let imageDimensions: any;
  switch (image) {
    case "woodOutline":
      require("../../assets/9Sprites/woodOutline.json");
  }


  let positions: string[] = ["TL", "TM", "TR", "ML", "MM", "MR", "BL", "BM", "BR"];
  let widths: number[] = [];
  let heights: number[] = [];

  positions.forEach(position => {
    widths.push(Number(imageDimensions[position + "_" + image + ".png"].sourceSize.w));
    heights.push(Number(imageDimensions[position + "_" + image + ".png"].sourceSize.h));
  });

  appearanceList.push(new ImageSprite({ width: widths[0], height: heights[0], img: "TL_" + image + ".png", offset: { dx: (widths[0] / 2) - (width / 2), dy: (heights[0] / 2) - (height / 2) } }));
  appearanceList.push(new ImageSprite({ width: width - widths[0] - widths[2], height: heights[1], img: "TM_" + image + ".png", offset: { dx: 0, dy: (heights[1] / 2) - (height / 2) } }));
  appearanceList.push(new ImageSprite({ width: widths[2], height: heights[2], img: "TR_" + image + ".png", offset: { dx: (width / 2) - (widths[2] / 2), dy: (heights[2] / 2) - (height / 2) } }));
  appearanceList.push(new ImageSprite({ width: widths[3], height: height - heights[0] - heights[6], img: "ML_" + image + ".png", offset: { dx: (widths[3] / 2) - (width / 2), dy: 0 } }));
  appearanceList.push(new ImageSprite({ width: width - widths[3] - widths[5], height: height - heights[1] - heights[7], img: "MM_" + image + ".png", offset: { dx: 0, dy: 0 } }));
  appearanceList.push(new ImageSprite({ width: widths[5], height: height - heights[2] - heights[8], img: "MR_" + image + ".png", offset: { dx: (width / 2) - (widths[5] / 2), dy: 0 } }));
  appearanceList.push(new ImageSprite({ width: widths[6], height: heights[6], img: "BL_" + image + ".png", offset: { dx: (widths[6] / 2) - (width / 2), dy: (height / 2) - (heights[6] / 2) } }));
  appearanceList.push(new ImageSprite({ width: width - widths[6] - widths[8], height: heights[7], img: "BM_" + image + ".png", offset: { dx: 0, dy: (height / 2) - (heights[7] / 2) } }));
  appearanceList.push(new ImageSprite({ width: widths[8], height: heights[8], img: "BR_" + image + ".png", offset: { dx: (width / 2) - (widths[8] / 2), dy: (height / 2) - (heights[8] / 2) } }));

  return appearanceList;

}
