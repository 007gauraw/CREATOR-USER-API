import express from "express";
import { textToImageGenerator } from "../llm_services/textToImageGeneratorService.js";
import {
  getPresignedUrl,
  uploadImageToS3,
} from "../aws_services/s3Services.js";
const router = express.Router();

/* POST text to story. */
router.post("/textToImages", async function (req, res, next) {
  try {
    const arrayOfImagesDescription = req.body.jsonString;
    const userEmail = req.user.email;
    const userName = req.user.username;
    let presignedUrls = [];
    //--- temp mock data ---

    presignedUrls = [
      {
        presignedUrl:
          "https://replicate-ai-assets-image-dev.s3.ap-south-1.amazonaws.com/images/gaurav2/5351daec-7d80-4e4c-b428-e1542d78f057.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAZL3WBREUV4C7LSWE%2F20250518%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20250518T065725Z&X-Amz-Expires=3600&X-Amz-Signature=03e74fd0566e715ddeb6eda709e20f0607580810feeaf9cdff56915c98213245&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
        imageId: "5351daec-7d80-4e4c-b428-e1542d78f057",
      },
      {
        presignedUrl:
          "https://replicate-ai-assets-image-dev.s3.ap-south-1.amazonaws.com/images/gaurav2/9b4492df-4646-44c2-bf47-e98513075aa8.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAZL3WBREUV4C7LSWE%2F20250518%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20250518T065725Z&X-Amz-Expires=3600&X-Amz-Signature=dffd43163deca2b4b28c61fecc29098c24b419654aad7e1f29c35ff7003bc7e8&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
        imageId: "9b4492df-4646-44c2-bf47-e98513075aa8",
      },
      {
        presignedUrl:
          "https://replicate-ai-assets-image-dev.s3.ap-south-1.amazonaws.com/images/gaurav2/66dffe04-b94c-4179-a275-3c6fe0a3f26e.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAZL3WBREUV4C7LSWE%2F20250518%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20250518T065725Z&X-Amz-Expires=3600&X-Amz-Signature=b8e6f767bc0511c5b110a7b00b2373bc89173ec9048dad7f3e64aa294277a021&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
        imageId: "66dffe04-b94c-4179-a275-3c6fe0a3f26e",
      },
      {
        presignedUrl:
          "https://replicate-ai-assets-image-dev.s3.ap-south-1.amazonaws.com/images/gaurav2/b9a05e11-94aa-44af-94a0-37a2b38ae921.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAZL3WBREUV4C7LSWE%2F20250518%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20250518T065725Z&X-Amz-Expires=3600&X-Amz-Signature=fd849835e87b9ff7637dbadb11262810dacbb0c1badafe1a38becc7a597f7bac&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
        imageId: "b9a05e11-94aa-44af-94a0-37a2b38ae921",
      },
      {
        presignedUrl:
          "https://replicate-ai-assets-image-dev.s3.ap-south-1.amazonaws.com/images/gaurav2/0b13cb29-f435-4275-85f1-59b119fc042c.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAZL3WBREUV4C7LSWE%2F20250518%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20250518T065725Z&X-Amz-Expires=3600&X-Amz-Signature=65690dff7697bb763d986472a3c2400cde9350664b126fa243fe12dd206f0885&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
        imageId: "0b13cb29-f435-4275-85f1-59b119fc042c",
      },
    ];
    return res.status(200).json({ presignedUrls });

    // -- end temp mock data --

    if (!arrayOfImagesDescription || !Array.isArray(arrayOfImagesDescription)) {
      return res.status(400).json({
        error: "Invalid input. imagesDescriptionArray must be an array.",
      });
    }

    const imageGenerationPromises = arrayOfImagesDescription.map(
      async (item) => {
        if (item.imageDescription) {
          return textToImageGenerator(item.imageDescription, item.id);
        }
        return null;
      }
    );

    let generatedImages = await Promise.all(imageGenerationPromises);

    // store generated image to s3 bucket and get the pre signed url
    presignedUrls = await Promise.all(
      generatedImages.map(async (item) => {
        if (item) {
          let key = `images/${userName}/${item.id}.png`;

          const uploadRes = await uploadImageToS3(
            item.response[0].url(),
            process.env.AWS_BUCKET_NAME,
            key
          );
          if (uploadRes.success) {
            const presignedUrl = await getPresignedUrl(
              process.env.AWS_BUCKET_NAME,
              key,
              item.id
            );
            return presignedUrl;
          }
        }
        return null;
      })
    );

    res.status(200).json({ presignedUrls });
  } catch (error) {
    console.error("Error generating story:", error);
    res.status(500).json({ error: "Failed to generate story" });
  }
});

/* GET presigned urls for existing images */
router.post("/getPresignedUrl", async function (req, res, next) {
  try {
    const { ids } = req.body;
    const userName = req.user.username;

    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: "Image ids array is required" });
    }

    const presignedUrls = await Promise.all(
      ids.map(async (id) => {
        let key = `images/${userName}/${id}.png`;
        const presignedUrl = await getPresignedUrl(
          process.env.AWS_BUCKET_NAME,
          key,
          id
        );
        return presignedUrl;
      })
    );

    res.status(200).json({ presignedUrls });
  } catch (error) {
    console.error("Error getting presigned URLs:", error);
    res.status(500).json({ error: "Failed to get presigned URLs" });
  }
});

export default router;
