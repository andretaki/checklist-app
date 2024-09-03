import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Use the POSTGRES_URL from your environment variables
const connectionString = process.env.POSTGRES_URL;

// Check if the connection string is available
if (!connectionString) {
  throw new Error('POSTGRES_URL is not defined in the environment variables');
}

// Create the Postgres client
const client = postgres(connectionString, { ssl: 'require' });

// Create and export the database instance
export const db = drizzle(client);