/*
  smoke-test.js
  Simple health-checker that queries /health on ports 8080-8085 and reports status.
  Usage: node scripts/smoke-test.js
*/

const https = require('http');

const targets = [
  { name: 'clanwar-bot', port: 8080 },
  { name: 'cpf-bot', port: 8081 },
  { name: 'discord-ai-bot', port: 8082 },
  { name: 'discord-meme-bot', port: 8083 },
  { name: 'new generate', port: 8084 },
  { name: 'playerprofile', port: 8085 },
];

function check(target) {
  return new Promise((resolve) => {
    const options = { hostname: '127.0.0.1', port: target.port, path: '/health', method: 'GET', timeout: 3000 };
    const req = https.request(options, (res) => {
      resolve({ name: target.name, port: target.port, status: res.statusCode });
    });
    req.on('error', (err) => resolve({ name: target.name, port: target.port, error: err.message }));
    req.on('timeout', () => { req.destroy(); resolve({ name: target.name, port: target.port, error: 'timeout' }); });
    req.end();
  });
}

(async () => {
  console.log('Running smoke tests against local health endpoints...');
  const results = await Promise.all(targets.map(check));
  let ok = true;
  for (const r of results) {
    if (r.status === 200) console.log(`- ${r.name} (port ${r.port}): OK`);
    else { ok = false; console.error(`- ${r.name} (port ${r.port}): FAILED`, r.error ? r.error : `status ${r.status}`); }
  }
  if (!ok) process.exit(1);
  console.log('\nAll health endpoints returned 200 OK.');
  process.exit(0);
})();
