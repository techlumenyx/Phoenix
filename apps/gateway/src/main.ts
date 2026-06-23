import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

const ROUTER_CONFIG = join(__dirname, 'router.yaml');
const SUPERGRAPH = join(__dirname, 'supergraph.graphql');

function startRouter() {
  if (!existsSync(SUPERGRAPH)) {
    console.error(
      '[gateway] supergraph.graphql not found. Run compose-supergraph script first.',
    );
    process.exit(1);
  }

  const args = [
    '--config', ROUTER_CONFIG,
    '--supergraph', SUPERGRAPH,
    '--log', process.env['NODE_ENV'] === 'development' ? 'info' : 'warn',
  ];

  const port = process.env['PORT'] ?? '4000';
  args.push('--listen', `0.0.0.0:${port}`);

  const routerBin = process.env['APOLLO_ROUTER_BIN'] ?? 'router';

  const router = spawn(routerBin, args, {
    stdio: 'inherit',
    env: { ...process.env },
  });

  router.on('error', (err) => {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      console.error(
        '[gateway] Apollo Router binary not found. Download it from https://router.apollo.dev and add to PATH, or set APOLLO_ROUTER_BIN env var.',
      );
    } else {
      console.error('[gateway] Router error:', err);
    }
    process.exit(1);
  });

  router.on('exit', (code) => {
    if (code !== 0) {
      console.error(`[gateway] Router exited with code ${code}`);
      process.exit(code ?? 1);
    }
  });

  console.log(`[gateway] Apollo Router starting on port ${port}`);
}

startRouter();
