import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Please add your Supabase database URL to environment variables.",
  );
}

console.log('Supabase DATABASE_URL configured:', process.env.DATABASE_URL ? 'Yes' : 'No');

// Configure postgres connection for Supabase
const client = postgres(process.env.DATABASE_URL, {
  ssl: 'require',
  max: 1, // Limit connections for serverless
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client, { schema });

// Test connection
client`SELECT 1`.then(() => {
  console.log('✅ Supabase database connected successfully');
}).catch((error) => {
  console.error('❌ Supabase database connection failed:', error);
});
