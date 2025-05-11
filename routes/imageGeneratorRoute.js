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

    // let presignedUrls = [
    //   {
    //     presignedUrl:
    //       "https://replicate-ai-assets-image-dev.s3.ap-south-1.amazonaws.com/images/gaurav2/f3914454-6704-45c5-bd59-ff8778bd5195.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAZL3WBREUV4C7LSWE%2F20250503%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20250503T133357Z&X-Amz-Expires=3600&X-Amz-Signature=a5d699321db68cd8790bf5174d72a5d4592c417a1687c18059f55821308492b4&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
    //     imageId: "f3914454-6704-45c5-bd59-ff8778bd5195",
    //   },
    //   {
    //     presignedUrl:
    //       "https://replicate-ai-assets-image-dev.s3.ap-south-1.amazonaws.com/images/gaurav2/18f9fee8-a623-498b-ad8e-6b3454e79623.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAZL3WBREUV4C7LSWE%2F20250503%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20250503T133358Z&X-Amz-Expires=3600&X-Amz-Signature=74f648803ddd9afeb91a16e096b2b738cfebacf4b12993731fd402c2fc23f3a2&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
    //     imageId: "18f9fee8-a623-498b-ad8e-6b3454e79623",
    //   },
    //   {
    //     presignedUrl:
    //       "https://replicate-ai-assets-image-dev.s3.ap-south-1.amazonaws.com/images/gaurav2/837e57ce-5dd5-4e36-86f9-b10ef5fcdca3.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAZL3WBREUV4C7LSWE%2F20250503%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20250503T133358Z&X-Amz-Expires=3600&X-Amz-Signature=9ef06addf4dc36951558cd8e964d56ad04da6e26274e228442551c8fe14bbb25&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
    //     imageId: "837e57ce-5dd5-4e36-86f9-b10ef5fcdca3",
    //   },
    //   {
    //     presignedUrl:
    //       "https://replicate-ai-assets-image-dev.s3.ap-south-1.amazonaws.com/images/gaurav2/f49a697d-1b71-4213-9f30-aa17a14458b9.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAZL3WBREUV4C7LSWE%2F20250503%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20250503T133358Z&X-Amz-Expires=3600&X-Amz-Signature=3d734e0239ccb9dd3916b5d8416de46c79f9922c086665fc59758d442a405dde&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
    //     imageId: "f49a697d-1b71-4213-9f30-aa17a14458b9",
    //   },
    //   {
    //     presignedUrl:
    //       "https://replicate-ai-assets-image-dev.s3.ap-south-1.amazonaws.com/images/gaurav2/e2779c1d-94a0-4eeb-a9eb-2036d91a1d00.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAZL3WBREUV4C7LSWE%2F20250503%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20250503T133358Z&X-Amz-Expires=3600&X-Amz-Signature=a8a440a57c5125c6d54147594a48b822fbe54048596d0138d71bdcfbefd83673&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
    //     imageId: "e2779c1d-94a0-4eeb-a9eb-2036d91a1d00",
    //   },
    //   {
    //     presignedUrl:
    //       "https://replicate-ai-assets-image-dev.s3.ap-south-1.amazonaws.com/images/gaurav2/30fa6671-7ec3-4333-b413-0010ff6fada7.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAZL3WBREUV4C7LSWE%2F20250503%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20250503T133359Z&X-Amz-Expires=3600&X-Amz-Signature=32e0f8e028d56cec39b5591aa723afb08766685c31884df31759408163328e5a&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
    //     imageId: "30fa6671-7ec3-4333-b413-0010ff6fada7",
    //   },
    //   {
    //     presignedUrl:
    //       "https://replicate-ai-assets-image-dev.s3.ap-south-1.amazonaws.com/images/gaurav2/1b8d6b4e-ef22-478e-a1ba-a03711b48646.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAZL3WBREUV4C7LSWE%2F20250503%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20250503T133358Z&X-Amz-Expires=3600&X-Amz-Signature=16a69ef01acd0d6bc68037bc6c4232cd7ca633a8e31916b0afc49673960c05df&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
    //     imageId: "1b8d6b4e-ef22-478e-a1ba-a03711b48646",
    //   },
    //   {
    //     presignedUrl:
    //       "https://replicate-ai-assets-image-dev.s3.ap-south-1.amazonaws.com/images/gaurav2/0ba60766-ce5c-42dd-b2a0-2f532e70245d.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAZL3WBREUV4C7LSWE%2F20250503%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20250503T133357Z&X-Amz-Expires=3600&X-Amz-Signature=38b28219597109bf8edcaa6d3bbca4e462511a6256f33d78749db49cfb0b883f&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
    //     imageId: "0ba60766-ce5c-42dd-b2a0-2f532e70245d",
    //   },
    //   {
    //     presignedUrl:
    //       "https://replicate-ai-assets-image-dev.s3.ap-south-1.amazonaws.com/images/gaurav2/aa5279b0-ff0f-4c1a-ae3b-8dcefb54eff2.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAZL3WBREUV4C7LSWE%2F20250503%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20250503T133358Z&X-Amz-Expires=3600&X-Amz-Signature=c2fd182f28ddab93f8f68c3b3bfb757036d79f42767845c2b76784a5a97ae6c8&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
    //     imageId: "aa5279b0-ff0f-4c1a-ae3b-8dcefb54eff2",
    //   },
    //   {
    //     presignedUrl:
    //       "https://replicate-ai-assets-image-dev.s3.ap-south-1.amazonaws.com/images/gaurav2/23e6415c-046e-4237-a2ff-b0af4431ef8b.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAZL3WBREUV4C7LSWE%2F20250503%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20250503T133357Z&X-Amz-Expires=3600&X-Amz-Signature=8186d23e68fef6e6f5e2c6316ab38bab82469355b8e163bbaf6a7115a54bfc12&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
    //     imageId: "23e6415c-046e-4237-a2ff-b0af4431ef8b",
    //   },
    // ];
    // return res.status(200).json({ presignedUrls });

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

export default router;
