import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const roots = ['src']
const extensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.css', '.html', '.json'])
const suspicious = [
  /Ã[\u0080-\u00bf]/,
  /Â[\u0080-\u00bf]/,
  /â€™/,
  /â€œ/,
  /â€\u009d/,
  /â€”/,
  /â€“/,
  /âœ/,
  /ðŸ/,
]
const ignoreDirs = new Set(['node_modules', 'dist', '.git'])
const findings = []

function extname(file) {
  const dot = file.lastIndexOf('.')
  return dot >= 0 ? file.slice(dot) : ''
}

function walk(dir) {
  for (const item of readdirSync(dir)) {
    if (ignoreDirs.has(item)) continue
    const path = join(dir, item)
    const stat = statSync(path)
    if (stat.isDirectory()) {
      walk(path)
      continue
    }
    if (!extensions.has(extname(item))) continue

    const text = readFileSync(path, 'utf8')
    const lines = text.split(/\r?\n/)
    lines.forEach((line, index) => {
      if (suspicious.some((pattern) => pattern.test(line))) {
        findings.push(`${path}:${index + 1}: ${line.trim()}`)
      }
    })
  }
}

roots.forEach(walk)

if (findings.length) {
  console.error('Possíveis textos com encoding quebrado encontrados:')
  console.error(findings.slice(0, 80).join('\n'))
  if (findings.length > 80) console.error(`...e mais ${findings.length - 80} ocorrência(s).`)
  process.exit(1)
}

console.log('Encoding UTF-8 verificado sem mojibake aparente.')
