import dotenv from "dotenv";
import { getReplicate } from "./replicateService.js";

dotenv.config();
let cache = {};
export async function generateText(input) {
  const replicate = getReplicate();

  // let response = [
  //   "",
  //   "[",
  //   "\n  {\"text\": \" Kaliyuga is",
  //   " considered the last and darkest of the four yugas (ages) in",
  //   " Hindu cosmology, characterized by spiritual decline and moral degradation",
  //   ".\", \"imageDescription\": \"A dark symbolic representation",
  //   " of Kaliyuga showing chaos and declining spiritual",
  //   " values\"},\n  {\"text\": \" According to Hindu scrip",
  //   "tures, Kaliyuga began in 3102 BCE",
  //   " when Lord Krishna departed from the earth and will last",
  //   " for 432,000 years.\", \"imageDescription\": \"A",
  //   " timeline illustration showing the beginning of Kaliyuga with",
  //   " Krishna's departure\"},\n  {\"text\": \" In",
  //   " Kaliyuga, dharma (righteousness) is said to stan",
  //   "d on only one leg, having lost three-fourths of its power",
  //   " compared to the golden Satya Yuga",
  //   ".\", \"imageDescription\": \"An illustration of dhar",
  //   "ma personified as a bull standing precariously on one leg",
  //   "\"},\n  {\"text\": \" This age is characterize",
  //   "d by materialism, greed, and spiritual ignor",
  //   "ance where wealth becomes more important than character.\", \"imageDescription\":",
  //   " \"People worshipping material possessions with money and luxury",
  //   " items in focus\"},\n  {\"text\": \" Relationships",
  //   " in Kaliyuga are believed to become trans",
  //   "actional, with marriages based on superficial attraction rather than spiritual",
  //   " compatibility.\", \"imageDescription\": \"A contrasting image showing shallow",
  //   " modern relationships versus traditional sacred unions\"},\n  {\"text\": \" Environmental",
  //   " degradation is considered a hallmark of Kaliy",
  //   "uga, with predictions of irregular seasons and declining natural",
  //   " resources.\", \"imageDescription\": \"A split image showing environmental pollution",
  //   ", climate change effects and natural disasters\"},\n  {\"text",
  //   "\": \" The scriptures predict shorter lifespans in",
  //   " Kaliyuga, with humans living only up to 100 years",
  //   " compared to thousands in previous yugas.\", \"imageDescription",
  //   "\": \"A visual representation showing the declining human lifespan across",
  //   " the four yugas\"},\n  {\"text\": \" Despite",
  //   " being the darkest age, Kaliyuga offers",
  //   " the easiest path to salvation through simple spiritual practices like",
  //   " chanting divine names.\", \"imageDescription\": \"People",
  //   " from diverse backgrounds engaged in simple devotional practices like",
  //   " chanting and meditation\"},\n  {\"text\": \" Many",
  //   " Hindu texts predict the coming of Kalki, the tenth",
  //   " avatar of Vishnu, who will appear at the end of",
  //   " Kaliyuga to destroy evil and usher in a new",
  //   " Satya Yuga.\", \"imageDescription\": \"A powerful",
  //   " figure of Kalki on a white horse with a blaz",
  //   "ing sword, ready to battle evil forces\"},\n  {\"text",
  //   "\": \" Some scholars interpret Kaliyuga not",
  //   " as a fixed time period but as a state of consciousness that",
  //   " can be transcended through spiritual awakening regardless of the",
  //   " external age.\", \"imageDescription\": \"A person in",
  //   " meditation breaking through dark clouds of ignorance into spiritual",
  //   " light\"}\n]",
  //   "",
  // ]

  let response = await replicate.run("anthropic/claude-3.7-sonnet", { input });

  return response;
}
