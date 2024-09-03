import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

// if (!process.env.POSTGRES_URL) {
//   throw new Error("POSTGRES_URL environment variable is not set");
// }

export default defineConfig({
  schema: './andre/checklist-app/db/schema.ts',
  dialect: 'postgresql',
  out: './drizzle/migrations',
  dbCredentials: {
    url: "postgres://default:Lm6cG2iOHprI@ep-blue-bar-a4hj4ojg-pooler.us-east-1.aws.neon.tech/verceldb?sslmode=require",
  }
});
