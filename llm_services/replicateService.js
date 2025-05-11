import dotenv from 'dotenv';
import Replicate from 'replicate';

dotenv.config();

let replicateInstance = null;

export function getReplicate() {
    if (!replicateInstance) {
        replicateInstance = new Replicate({
            auth: process.env.REPLICATE_API_TOKEN,
        });
    }
    return replicateInstance;
}