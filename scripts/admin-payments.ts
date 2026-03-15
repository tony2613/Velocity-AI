import { db } from "../server/db";
import { users, paymentRequests } from "../shared/schema";
import { eq } from "drizzle-orm";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const askQuestion = (query: string): Promise<string> => {
  return new Promise(resolve => rl.question(query, resolve));
};

async function main() {
  console.log("=== VelocityAI Admin: Pending Payments ===");
  
  try {
    const pendingRequests = await db.query.paymentRequests.findMany({
      where: eq(paymentRequests.status, "pending"),
      with: {
        user: true
      }
    });

    if (pendingRequests.length === 0) {
      console.log("No pending payment requests found.");
      process.exit(0);
    }

    console.log(`Found ${pendingRequests.length} pending requests:\n`);
    
    for (const req of pendingRequests) {
      console.log(`[ID: ${req.id}] User: ${req.user.username} (${req.user.id}) | Tier: ${req.tier} | Amount: ₹${req.amount} | UTR: ${req.transactionId} | Date: ${req.createdAt}`);
    }

    console.log("\nWhat would you like to do?");
    console.log("1. Approve a request");
    console.log("2. Reject a request");
    console.log("3. Exit");
    
    const choice = await askQuestion("Enter your choice (1/2/3): ");

    if (choice === "1" || choice === "2") {
      const isApproval = choice === "1";
      const idStr = await askQuestion(`Enter the Request ID to ${isApproval ? 'APPROVE' : 'REJECT'}: `);
      const reqId = parseInt(idStr, 10);
      
      if (isNaN(reqId)) {
        console.log("Invalid ID.");
        process.exit(1);
      }

      const request = pendingRequests.find(r => r.id === reqId);
      if (!request) {
        console.log("Request ID not found in pending list.");
        process.exit(1);
      }

      if (isApproval) {
        // Approve
        await db.update(users)
          .set({ subscriptionTier: request.tier })
          .where(eq(users.id, request.userId));
        
        await db.update(paymentRequests)
          .set({ status: 'approved' })
          .where(eq(paymentRequests.id, reqId));
          
        console.log(`✅ Request ${reqId} APPROVED. User ${request.user.username} upgraded to ${request.tier}.`);
      } else {
        // Reject
        await db.update(paymentRequests)
          .set({ status: 'rejected' })
          .where(eq(paymentRequests.id, reqId));
          
        console.log(`❌ Request ${reqId} REJECTED.`);
      }
    }
  } catch (error) {
    console.error("Error running admin script:", error);
  }

  process.exit(0);
}

main();
