import dns from 'node:dns';

const host = 'ep-dry-hat-a13bm9qi-pooler.ap-southeast-1.aws.neon.tech';

console.log(`[DNS TEST IPv4] Looking up: ${host}...`);

dns.lookup(host, { family: 4 }, (err, address, family) => {
  if (err) {
    console.error(`[DNS TEST IPv4] ❌ FAILED: ${err.message}`);
    process.exit(1);
  } else {
    console.log(`[DNS TEST IPv4] ✅ SUCCESS: Address=${address}, Family=IPv${family}`);
    process.exit(0);
  }
});
