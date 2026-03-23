/**
 * VelocityAI Admin Payment Approval Script
 * Run: npx tsx scripts/admin-payments.ts
 * (Uses tsx which handles both ESM and CJS seamlessly)
 */
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
  dotenv.config({ path: path.resolve(process.cwd(), ".env") });
}

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in .env.local or .env");
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
  console.log("=== VelocityAI Admin: Pending Payments ===\n");

  const pending = await db.query.paymentRequests.findMany({
    where: eq(schema.paymentRequests.status, "pending"),
    with: { user: true },
  });

  if (pending.length === 0) {
    console.log("✅ No pending payment requests.\n");
    rl.close();
    await pool.end();
    return;
  }

  console.log(`Found ${pending.length} pending request(s):\n`);
  for (const req of pending) {
    const u = (req as any).user;
    console.log(
      `  [ID: ${req.id}] User: ${u?.username ?? "?"} (${req.userId}) | Tier: ${req.tier} | Amount: ₹${req.amount} | UTR: ${req.transactionId} | Date: ${req.createdAt}`
    );
  }

  console.log("\nOptions:");
  console.log("  1. Approve a request (activates subscription for 30 days)");
  console.log("  2. Reject a request");
  console.log("  3. Exit");

  const choice = await ask("\nEnter choice (1/2/3): ");

  if (choice === "1" || choice === "2") {
    const isApproval = choice === "1";
    const idStr = await ask(
      `Enter Request ID to ${isApproval ? "APPROVE ✅" : "REJECT ❌"}: `
    );
    const reqId = parseInt(idStr.trim(), 10);

    if (isNaN(reqId)) {
      console.log("❌ Invalid ID.");
      rl.close();
      await pool.end();
      return;
    }

    const found = pending.find((r) => r.id === reqId);
    if (!found) {
      console.log("❌ Request ID not found in pending list.");
      rl.close();
      await pool.end();
      return;
    }

    if (isApproval) {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30);

      await db
        .update(schema.users)
        .set({
          subscriptionTier: found.tier,
          subscriptionExpiresAt: expiresAt,
        })
        .where(eq(schema.users.id, found.userId));

      await db
        .update(schema.paymentRequests)
        .set({ status: "approved" })
        .where(eq(schema.paymentRequests.id, reqId));

      const u = (found as any).user;
      console.log(
        `\n✅ Approved! User "${u?.username}" upgraded to "${found.tier}" until ${expiresAt.toDateString()}.`
      );
    } else {
      await db
        .update(schema.paymentRequests)
        .set({ status: "rejected" })
        .where(eq(schema.paymentRequests.id, reqId));

      console.log(`\n❌ Request ${reqId} rejected.`);
    }
  } else {
    console.log("Bye!");
  }

  rl.close();
  await pool.end();
}

main().catch((err) => {
  console.error("Script error:", err);
  process.exit(1);
});
