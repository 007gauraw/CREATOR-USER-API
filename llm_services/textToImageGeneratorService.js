import { getReplicate } from "./replicateService.js";
const modelConfig = {
  model: "black-forest-labs/flux-schnell",
};
const modelInputBody = {
  prompt:
    'black forest gateau cake spelling out the words "FLUX SCHNELL", tasty, food photography, dynamic shot',
  go_fast: true,
  megapixels: "1",
  num_outputs: 1,
  aspect_ratio: "16:9",
  output_format: "png",
  output_quality: 80,
  num_inference_steps: 4,
};

export async function textToImageGenerator(prompt, id) {
  const replicate = getReplicate();
  modelInputBody.prompt = prompt;
  try {
    const response = await replicate.run(modelConfig.model, {
      input: modelInputBody,
    });

    return { response, id };
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("Failed to generate image");
  }
}
