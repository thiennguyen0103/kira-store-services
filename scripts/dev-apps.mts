/**
 * Start all Nest apps on the host with --watch (hybrid workflow).
 * Prefer: pnpm docker:up && pnpm dev:apps
 */
import { spawn, type ChildProcess } from 'node:child_process';

const APPS = [
  'api-gateway',
  'identity-service',
  'users-service',
  'orders-service',
  'payments-service',
  'products-service',
  'media-service',
] as const;

const children = new Map<string, ChildProcess>();
let shuttingDown = false;

function prefixLines(name: string, chunk: Buffer | string, stream: NodeJS.WritableStream): void {
  const text = chunk.toString();
  for (const line of text.split(/\r?\n/)) {
    if (line.length === 0) continue;
    stream.write(`[${name}] ${line}\n`);
  }
}

function startApp(name: string): void {
  const child = spawn(
    'pnpm',
    ['exec', 'nest', 'start', name, '--watch'],
    {
      cwd: process.cwd(),
      env: process.env,
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  children.set(name, child);

  child.stdout?.on('data', (chunk: Buffer) => {
    prefixLines(name, chunk, process.stdout);
  });
  child.stderr?.on('data', (chunk: Buffer) => {
    prefixLines(name, chunk, process.stderr);
  });

  child.on('exit', (code, signal) => {
    children.delete(name);
    if (shuttingDown) return;
    const reason = signal ? `signal ${signal}` : `code ${code ?? 0}`;
    console.error(`[dev:apps] ${name} exited (${reason}); stopping others`);
    shutdown(code && code !== 0 ? code : 1);
  });
}

function shutdown(exitCode = 0): void {
  if (shuttingDown) return;
  shuttingDown = true;
  for (const child of children.values()) {
    child.kill('SIGTERM');
  }
  setTimeout(() => process.exit(exitCode), 500).unref();
}

for (const app of APPS) {
  startApp(app);
}

console.log(`[dev:apps] started ${APPS.length} Nest services (Ctrl+C to stop)`);

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
