/**
 * env.js — Must be the first import in server.js
 * Loads the .env file using an absolute path derived from this file's location,
 * ensuring correct resolution regardless of which directory the process was launched from.
 * The `override: true` flag forces env vars in the file to take precedence over
 * any shell-level environment variables that might conflict.
 */
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve the .env file path relative to the backend root (two dirs up from config/)
const envPath = path.resolve(__dirname, "../../.env");

dotenv.config({ path: envPath, override: true });
