import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const projectRoot = path.resolve(import.meta.dirname, '..');
const repositoryRoot = path.resolve(projectRoot, '..');

function read(relativePath: string) {
  return fs.readFileSync(path.join(repositoryRoot, relativePath), 'utf8');
}

test('CI deploys only verified main releases and stays opt-in', () => {
  const workflow = read('.github/workflows/ci.yml');
  const deployJob = workflow.slice(workflow.indexOf('\n  deploy:'));

  assert.match(workflow, /needs: verify/);
  assert.match(workflow, /vars\.CPANEL_DEPLOY_ENABLED == 'true'/);
  assert.match(workflow, /actions\/upload-artifact@v4/);
  assert.match(deployJob, /actions\/download-artifact@v4/);
  assert.match(deployJob, /Run migrations and publish release/);
  assert.match(deployJob, /Verify production and roll back on failure/);
  assert.doesNotMatch(deployJob, /npm (ci|install|run build)/);
});

test('standalone package contains migration and release assets', () => {
  const pack = read('next-zeo/scripts/pack-standalone.sh');

  assert.match(pack, /deployment\/run-migrations\.mjs/);
  assert.match(pack, /deployment\/cpanel-release\.sh/);
  assert.match(pack, /src\/server\/db\/migrations\/\*\.sql/);
  assert.match(pack, /rm -f "\$ARCHIVE"/);
});

test('remote deployment is locked, preserves shared files and restarts Passenger', () => {
  const script = read('next-zeo/deployment/cpanel-release.sh');
  const migrateIndex = script.indexOf('Running pending database migrations');
  const publishIndex = script.indexOf('Publishing release');

  assert.match(script, /Another deployment is already running/);
  assert.match(script, /rsync -a --delete/);
  assert.match(script, /--exclude '\.env'/);
  assert.match(script, /--exclude 'uploads\/'/);
  assert.match(script, /touch "\$APP_ROOT\/tmp\/restart\.txt"/);
  assert.match(script, /Deployment failed after file switch; restoring/);
  assert.ok(migrateIndex >= 0 && publishIndex > migrateIndex, 'migrations must finish before the file switch');
});

test('production migration runner is low-concurrency and checksum compatible', () => {
  const runner = read('next-zeo/deployment/run-migrations.mjs');

  assert.match(runner, /connectionLimit: 1/);
  assert.match(runner, /function legacyChecksum/);
  assert.match(runner, /Applied migration checksum changed/);
  assert.match(runner, /ORDER BY filename/);
});
