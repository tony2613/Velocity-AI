import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../shared/schema";
import { eq } from "drizzle-orm";
import readline from "readline";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in .env.local");
  process.exit(1);
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (q: string): Promise<string> =>
  new Promise((resolve) => rl.question(q, resolve));

async function main() {
  console.log("=== VelocityAI: Set Admin Privileges ===\n");

  const username = await ask("Enter the username to make an admin: ");
  
  if (!username.trim()) {
      console.log("❌ Username cannot be empty.");
      process.exit(1);
  }

  const [user] = await db.select().from(schema.users).where(eq(schema.users.username, username.trim()));

  if (!user) {
      console.log(`❌ User '${username}' not found in the database.`);
  } else {
      await db.update(schema.users)
        .set({ isAdmin: true })
        .where(eq(schema.users.id, user.id));
        
      console.log(`\n✅ Success! User '${username}' is now an Admin.`);
      console.log(`They can now approve manual payments.`);
  }

  rl.close();
  await pool.end();
}

main().catch((err) => {
  console.error("Script error:", err);
  process.exit(1);
});
