#!/usr/bin/env node
const { spawnSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Usage: node start.js [BOT_DIR]
const argDir = process.argv[2];
const BOT_DIR = argDir || process.env.BOT_DIR || 'clanwar-bot';

console.log(`Starting bot in '${BOT_DIR}'...`);
const cwd = path.resolve(process.cwd(), BOT_DIR);
if (!fs.existsSync(cwd) || !fs.lstatSync(cwd).isDirectory()) {
  console.error(`Directory not found: ${BOT_DIR}`);
  process.exit(1);
}

process.chdir(cwd);

// Check node_modules presence
const nodeModulesPath = path.join(cwd, 'node_modules');
const hasNodeModules = fs.existsSync(nodeModulesPath) && fs.readdirSync(nodeModulesPath).length > 0;

if (process.env.FORCE_INSTALL !== '1' && hasNodeModules) {
  console.log('Skipping install — node_modules already present');
} else {
  console.log('Installing dependencies...');
  const res = spawnSync('npm', ['install', '--omit=dev', '--no-audit'], { stdio: 'inherit' });
  if (res.status !== 0) {
    console.error('npm install failed with code', res.status);
    process.exit(res.status || 1);
  }
}

console.log('Running npm start (this will replace the shell so signals are forwarded)...');

// Use shell mode on Windows to avoid spawn EINVAL issues; use npm.cmd implicitly when needed
const child = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['start'], { stdio: 'inherit', shell: process.platform === 'win32' });

// Forward signals
['SIGINT','SIGTERM','SIGHUP'].forEach(sig => {
  process.on(sig, () => {
    if (!child.killed) child.kill(sig);
  });
});

child.on('exit', (code, signal) => {
  if (signal) {
    console.log(`Child process exited with signal ${signal}`);
    process.exit(0);
  }
  console.log(`Child process exited with code ${code}`);
  process.exit(code);
});

child.on('error', (err) => {
  console.error('Failed to start child process:', err);
  process.exit(1);
});
