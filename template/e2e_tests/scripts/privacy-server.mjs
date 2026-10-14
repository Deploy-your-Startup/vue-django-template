import { mkdir, cp, mkdtemp, readFile, writeFile, symlink, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { resolve, join, basename } from 'node:path'
import { spawn } from 'node:child_process'

// Exercise real bundled application files with disposable operator configuration.
const source = resolve('../frontend')
const temporary = await mkdtemp(join(tmpdir(), 'site-consent-'))
await cp(source, temporary, { recursive: true, filter: path => !['node_modules', 'dist', '.git'].includes(basename(path)) })
await symlink(join(source, 'node_modules'), join(temporary, 'node_modules'), 'dir')
const policyPath = join(temporary, 'src/data/site-policy.json')
const policy = JSON.parse(await readFile(policyPath, 'utf8'))
Object.assign(policy, {
  operatorName: 'Example Operator', operatorAddress: 'Example Street 1, 12345 Example City',
  contactEmail: 'contact@example.test', privacyNotice: 'Test fixture disclosure for local browser verification.',
  reviewed: process.env.POLICY_STATE !== 'draft', analytics: process.env.POLICY_STATE === 'off' ? 'off' : 'consent'
})
await writeFile(policyPath, JSON.stringify(policy))
await mkdir(join(temporary, 'public'), {recursive:true})
await writeFile(join(temporary, 'public/config.js'), 'window.KPIS_SCRIPT_URL="/test-tracker.js";window.KPIS_WEBSITE_ID="test-site";')
// Local substitute only for the external Umami service; application consent code is real.
await writeFile(join(temporary, 'public/test-tracker.js'), `
window.trackerLoads = (window.trackerLoads || 0) + 1;
setInterval(() => {
  if (!localStorage.getItem('umami.disabled')) fetch('/test-collect', {method:'POST'});
}, 50);
`)
const child = spawn(process.execPath, [join(source, 'node_modules/vite/bin/vite.js'), '--host', '127.0.0.1', '--port', process.env.FRONTEND_PORT, '--strictPort'], { cwd: temporary, stdio: 'inherit' })
async function stop() { child.kill('SIGTERM'); await rm(temporary, {recursive:true, force:true}); }
process.on('SIGTERM', stop)
process.on('SIGINT', stop)
child.on('exit', async code => { await rm(temporary, {recursive:true, force:true}); process.exit(code || 0) })
