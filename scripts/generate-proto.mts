import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const protoDir = path.join(root, 'libs/shared/proto');
const outDir = path.join(root, 'libs/shared/generated');
const isWin = process.platform === 'win32';
const binExt = isWin ? '.cmd' : '';

const protoc = path.join(
  root,
  `node_modules/.bin/grpc_tools_node_protoc${binExt}`,
);
const plugin = path.join(root, `node_modules/.bin/protoc-gen-ts_proto${binExt}`);

const protos = fs
  .readdirSync(protoDir)
  .filter((file) => file.endsWith('.proto'))
  .map((file) => path.join(protoDir, file));

if (protos.length === 0) {
  console.error(`No .proto files found in ${protoDir}`);
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

const quote = (value: string): string => `"${value.replace(/"/g, '""')}"`;
const command = [
  quote(protoc),
  `--plugin=protoc-gen-ts_proto=${quote(plugin)}`,
  `--ts_proto_out=${quote(outDir)}`,
  '--ts_proto_opt=nestJs=true',
  `-I${quote(protoDir)}`,
  ...protos.map(quote),
].join(' ');

execSync(command, { stdio: 'inherit', shell: true });

console.log(
  `Generated ${protos.length} file(s) into ${path.relative(root, outDir)}`,
);
