require('dotenv').config();
const axios = require('axios');

async function testSerper() {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    console.error("❌ SERPER_API_KEY not found in .env");
    return;
  }

  console.log("🔍 Testing Serper.dev with query: 'VelocityAI features'...");
  try {
    const response = await axios.post('https://google.serper.dev/search', 
      { q: 'VelocityAI features', num: 3 },
      {
        headers: {
          'X-API-KEY': apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.status === 200) {
      console.log("✅ Serper API Success!");
      const results = response.data.organic || [];
      console.log(`Found ${results.length} results:`);
      results.forEach((r, i) => {
        console.log(`${i+1}. ${r.title}`);
        console.log(`   ${r.snippet}`);
      });
    } else {
      console.log(`❌ Serper API Error: ${response.status}`);
      console.log(response.data);
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    if (error.response) {
      console.error("   Status:", error.response.status);
      console.error("   Data:", error.response.data);
    }
  }
}

testSerper();
