/** One-time setup: creates the public "lab-images" bucket. Usage: npm run storage:setup */
import { config } from "dotenv";
config({ path: ".env.local" });

import { ensureImageBucket, IMAGE_BUCKET } from "../src/lib/storage";

ensureImageBucket()
  .then((result) => console.log(`Bucket "${IMAGE_BUCKET}": ${result}`))
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  });
