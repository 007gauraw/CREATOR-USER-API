import express from "express";
import { generateText } from "../llm_services/textToTextService.js";
import crypto from "crypto";

const router = express.Router();

/* POST text to story. */
router.post("/textToStory", async function (req, res, next) {
  try {
    const userPrompt = req.body.prompt;

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
