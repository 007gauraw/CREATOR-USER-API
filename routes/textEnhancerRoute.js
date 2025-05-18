import express from "express";
import { generateText } from "../llm_services/textToTextService.js";
import crypto from "crypto";

const router = express.Router();

/* POST text to story. */
router.post("/textToStory", async function (req, res, next) {
  try {
    const userPrompt = req.body.prompt;
    const mockResponse = [
      {
        text: "The Mahabharata is one of the two major Sanskrit epics of ancient India, composed between 400 BCE and 400 CE.",
        imageDescription:
          "Ancient Sanskrit text manuscript of the Mahabharata with intricate artwork",
        id: "5351daec-7d80-4e4c-b428-e1542d78f057",
      },
      {
        text: "The epic narrates the Kurukshetra War between the Kauravas and the Pandavas, cousins fighting for the throne of Hastinapura.",
        imageDescription:
          "Battle scene depicting the Kurukshetra War with warriors on chariots",
        id: "9b4492df-4646-44c2-bf47-e98513075aa8",
      },
      {
        text: "Lord Krishna delivers the Bhagavad Gita, a 700-verse Hindu scripture, to Arjuna on the battlefield as spiritual guidance.",
        imageDescription:
          "Krishna and Arjuna on a chariot during their famous dialogue of the Bhagavad Gita",
        id: "66dffe04-b94c-4179-a275-3c6fe0a3f26e",
      },
      {
        text: "With approximately 200,000 verse lines, 1.8 million words, and 100,000 shlokas, the Mahabharata is the longest epic poem ever written.",
        imageDescription:
          "Massive collection of bound Mahabharata volumes showing its enormous textual scope",
        id: "b9a05e11-94aa-44af-94a0-37a2b38ae921",
      },
      {
        text: "Beyond its historical narrative, the Mahabharata contains philosophical and devotional material, making it a guide for dharma (righteousness) and moral conduct.",
        imageDescription:
          "Symbolic representation of dharma with scales of justice and characters from the epic in contemplation",
        id: "0b13cb29-f435-4275-85f1-59b119fc042c",
      },
    ];

    return res.status(200).json({
      jsonString: mockResponse,
    });
    const proptTollm = `You need to give response in following format.
        [{"text": " whatever point 1", imageDescription: "what type of image generated for this point " }]
        no extra * or new line or any other thing.  
        `;
    if (!userPrompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }
    const input = {
      prompt: userPrompt,
      max_tokens: 8192,
      system_prompt: proptTollm,
      max_image_resolution: 0.5,
    };

    let story = await generateText(input);
    story = convertArrayOfTextToText(story);
    const cleanedString = story.replace(/[\n\\]/g, "");
    const jsonArray = JSON.parse(cleanedString);

    // Add UUID to each item in the array
    const jsonString = jsonArray.map((item) => ({
      ...item,
      id: crypto.randomUUID(),
    }));

    res.status(200).json({
      jsonString,
    });
  } catch (error) {
    console.error("Error generating story:", error);
    res.status(500).json({ error: "Failed to generate story" });
  }
});
const convertArrayOfTextToText = (textArray) => {
  const text = textArray.map((item) => item).join("\n");
  return text;
};

export default router;
