import {execFileSync} from 'node:child_process'
import {mkdirSync, writeFileSync} from 'node:fs'
import {resolve} from 'node:path'

const root = resolve(import.meta.dirname, '..')

function deployedCommit() {
  const environmentCommit = [
    process.env.HOSTINGER_GIT_COMMIT_SHA,
    process.env.GITHUB_SHA,
    process.env.VERCEL_GIT_COMMIT_SHA,
  ].find(Boolean)

  if (environmentCommit) return environmentCommit.trim()

  return execFileSync('git', ['rev-parse', 'HEAD'], {
    cwd: root,
    encoding: 'utf8',
  }).trim()
}

const commit = deployedCommit()
if (!/^[0-9a-f]{40}$/i.test(commit)) {
  throw new Error(`Cannot write deployment marker for invalid commit: ${commit}`)
}

const publicDirectory = resolve(root, 'public')
mkdirSync(publicDirectory, {recursive: true})
writeFileSync(resolve(publicDirectory, 'deployment-version.txt'), `${commit}\n`)
console.log(`Deployment marker: ${commit}`)
