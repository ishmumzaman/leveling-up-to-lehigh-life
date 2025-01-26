// Reviewed on 2024-09-18

/**
 * Slices a text into lines based on the number of characters per line.
 * 
 * @param charsPerLine  The number of characters per line.
 * @param text          The text to be sliced.
 * 
 * @returns The sliced text and its total number of lines.
 */
export function textSlicer(charsPerLine: number, text: string) {
  let totalLines = 1;
  let newText = "";
  let currentLine = "";
  const words = text.split(" ");
  for (const word of words) {
    if ((currentLine + word).length + 1 > charsPerLine) {
      totalLines++;
      newText += currentLine.trim() + "\n";
      currentLine = word + " ";
    } else {
      currentLine += word + " ";
    }
  }
  newText += currentLine.trim();
  return { newText, totalLines };
}