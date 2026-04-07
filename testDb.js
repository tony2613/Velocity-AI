import { db } from './server/db.js';
import { notes, summaries } from './shared/schema.js';

async function test() {
  try {
    const allsummaries = await db.select().from(summaries).limit(1);
    if (allsummaries.length > 0) {
      console.log('Found summary:', allsummaries[0].id);
      console.log('--- RAW SUMMARY START ---');
      console.log(JSON.stringify(allsummaries[0].content));
      console.log('--- RAW SUMMARY END ---');
    } else {
      console.log('No summary found.');
    }

  } catch (err) {
    console.error(err);
  }
}

test().then(() => process.exit(0));
