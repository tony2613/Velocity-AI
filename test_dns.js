import dns from 'node:dns';

const host = 'ep-dry-hat-a13bm9qi-pooler.ap-southeast-1.aws.neon.tech';

console.log(`[DNS TEST] Looking up: ${host}...`);

dns.lookup(host, (err, address, family) => {
  if (err) {
    console.error(`[DNS TEST] ❌ FAILED: ${err.message}`);
    process.exit(1);
  } else {
    console.log(`[DNS TEST] ✅ SUCCESS: Address=${address}, Family=IPv${family}`);
    process.exit(0);
  }
});
