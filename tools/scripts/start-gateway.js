const { existsSync } = require('node:fs');
const { resolve } = require('node:path');
const { spawn } = require('node:child_process');

const workspaceRoot = resolve(__dirname, '..', '..');
const configured = process.env.APOLLO_ROUTER_BIN;
const candidates = [
  configured && resolve(workspaceRoot, configured),
  resolve(workspaceRoot, 'tools', 'bin', process.platform === 'win32' ? 'router.exe' : 'router'),
  resolve(workspaceRoot, process.platform === 'win32' ? 'router.exe' : 'router'),
].filter(Boolean);
const router = candidates.find((candidate) => existsSync(candidate));
const supergraph = resolve(workspaceRoot, 'apps', 'gateway', 'supergraph.graphql');

if (!router) {
  console.error('Apollo Router was not found. Set APOLLO_ROUTER_BIN or place it in tools/bin/.');
  process.exit(1);
}
if (!existsSync(supergraph)) {
  console.error('The composed supergraph is missing. Run npm run gateway:compose first.');
  process.exit(1);
}

const child = spawn(
  router,
  [
    '--config',
    resolve(workspaceRoot, 'apps', 'gateway', 'router.yaml'),
    '--supergraph',
    supergraph,
    '--log',
    'info',
    '--listen',
    '0.0.0.0:4000',
  ],
  { cwd: workspaceRoot, stdio: 'inherit', env: process.env },
);

child.on('error', (error) => {
  console.error(`Apollo Router failed to start: ${error.message}`);
  process.exitCode = 1;
});
child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exitCode = code ?? 1;
});
