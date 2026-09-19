import {spawnSync} from 'node:child_process'

const rawSize = /(?:font-size|fontSize)\s*:\s*(?:\d+(?:\.\d+)?(?:px|rem|em)\b|clamp\()/
const sourcePaths = ['.css', '.html', '.js', '.jsx', '.ts', '.tsx'].map(
  (suffix) => `:(glob)**/*${suffix}`,
)

function gitDiff(...args) {
  const result = spawnSync(
    'git',
    ['diff', '--unified=0', ...args, '--', ...sourcePaths],
    {encoding: 'utf8'},
  )
  return result.stdout || ''
}

const workingDiff = gitDiff('HEAD')
const diff = workingDiff || gitDiff('HEAD^', 'HEAD')
const violations = []
let currentFile = ''

for (const line of diff.split('\n')) {
  if (line.startsWith('+++ b/')) {
    currentFile = line.slice(6)
  } else if (line.startsWith('+') && !line.startsWith('+++') && rawSize.test(line)) {
    violations.push(`${currentFile}: ${line.slice(1).trim()}`)
  }
}

if (violations.length) {
  console.error('New typography must use a named CSS token, not a numeric font size:')
  for (const violation of violations) console.error(`- ${violation}`)
  console.error('Use one of the --type-* roles documented in docs/typography.md.')
  process.exit(1)
}

console.log('Typography check passed: no new raw font-size declarations.')
