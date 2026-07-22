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
  assert.match(workflow, /actions\/checkout@v4[\s\S]*?lfs: true/);
  assert.match(deployJob, /actions\/download-artifact@v4/);
  assert.match(deployJob, /Run migrations and publish release/);
  assert.match(deployJob, /Verify production and roll back on failure/);
  assert.match(deployJob, /"\$release" == "\$GITHUB_SHA"/);
  assert.match(deployJob, /\/api\/health/);
  assert.match(deployJob, /lftp/);
  assert.match(deployJob, /ftp:ssl-force true/);
  assert.match(deployJob, /ssl:verify-certificate yes/);
  assert.match(deployJob, /for attempt in 1 2 3/);
  assert.match(deployJob, /CPANEL_DEPLOY_WEBHOOK_URL/);
  assert.match(deployJob, /CPANEL_DEPLOY_WEBHOOK_SECRET/);
  assert.match(deployJob, /hmac\.new/);
  assert.match(deployJob, /X-Zeo-Timestamp/);
  assert.match(deployJob, /X-Zeo-Signature/);
  assert.ok(deployJob.includes('Upload attempt $attempt failed'));
  assert.doesNotMatch(deployJob, /ssh /);
  assert.doesNotMatch(deployJob, /SCP=/);
  assert.doesNotMatch(deployJob, /SSH preflight/);
  assert.doesNotMatch(deployJob, /npm (ci|install|run build)/);
});

test('standalone package contains migration and release assets', () => {
  const pack = read('next-zeo/scripts/pack-standalone.sh');

  assert.match(pack, /deployment\/run-migrations\.mjs/);
  assert.match(pack, /deployment\/cpanel-release\.sh/);
  assert.match(pack, /deployment\/webhook\/deploy\.php/);
  assert.match(pack, /src\/server\/db\/migrations\/\*\.sql/);
  assert.match(pack, /release\.json/);
  assert.match(pack, /cp -a \.next\/standalone\/\. "\$STAGING_DIR\/"/);
  assert.match(pack, /STAGING_DIR\/\.next\/BUILD_ID/);
  assert.match(pack, /rm -f "\$ARCHIVE"/);
});

test('PHP webhook authenticates short-lived requests before launching the fixed activation script', () => {
  const webhook = read('next-zeo/deployment/webhook/deploy.php');
  const config = read('next-zeo/deployment/webhook/deploy-config.php.example');

  assert.match(webhook, /REQUEST_METHOD.*POST/);
  assert.match(webhook, /HTTP_X_ZEO_TIMESTAMP/);
  assert.match(webhook, /HTTP_X_ZEO_SIGNATURE/);
  assert.match(webhook, /abs\(time\(\) - \$timestamp\) > 300/);
  assert.match(webhook, /hash_hmac\('sha256'/);
  assert.match(webhook, /hash_equals/);
  assert.match(webhook, /\^\[a-f0-9\]\{40\}\$/);
  assert.match(webhook, /\^\[a-f0-9\]\{64\}\$/);
  assert.match(webhook, /proc_open/);
  assert.doesNotMatch(webhook, /pkill|killall|pm2/);
  assert.match(config, /activation_script/);
  assert.match(config, /app_root/);
  assert.match(config, /secret/);
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
  assert.doesNotMatch(script, /pkill/);
  assert.match(script, /cloudlinux-selector start/);
  assert.match(script, /--app-root "\$selector_root"/);
  assert.match(script, /worker_running/);
  assert.match(script, /timeout 30s cloudlinux-selector start/);
  assert.match(script, /Deployment failed after file switch; restoring/);
  assert.match(script, /ulimit -c 0/);
  assert.match(script, /UV_THREADPOOL_SIZE=1/);
  assert.match(script, /MALLOC_ARENA_MAX=2/);
  assert.match(script, /--v8-pool-size=1/);
  assert.match(script, /--max-old-space-size=192/);
  assert.match(script, /ulimit -t 120/);
  assert.match(script, /exec env/);
  assert.match(script, /EXPECTED_ARCHIVE_SHA256/);
  assert.match(script, /sha256sum/);
  assert.match(script, /migration_status == 134 \|\| migration_status == 137/);
  assert.ok(migrateIndex >= 0 && publishIndex > migrateIndex, 'migrations must finish before the file switch');
});

test('production migration runner is low-concurrency and checksum compatible', () => {
  const runner = read('next-zeo/deployment/run-migrations.mjs');

  assert.match(runner, /mysql\.createConnection/);
  assert.doesNotMatch(runner, /createPool/);
  assert.match(runner, /function legacyChecksum/);
  assert.match(runner, /Applied migration checksum changed/);
  assert.match(runner, /ORDER BY filename/);
});

test('health endpoint reports database status and packaged release identity', () => {
  const route = read('next-zeo/app/api/health/route.ts');

  assert.match(route, /testConnection\(\)/);
  assert.match(route, /release\.json/);
  assert.match(route, /status: "ok", release:/);
  assert.match(route, /dynamic = "force-dynamic"/);
});
