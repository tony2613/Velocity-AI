import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  try {
    const res = await pool.query('SELECT content FROM summaries LIMIT 1;');
    if (res.rows.length > 0) {
      console.log('--- CONTENT START ---');
      console.log(JSON.stringify(res.rows[0].content));
      console.log('--- CONTENT END ---');
    } else {
      console.log('No summaries found.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

run();
