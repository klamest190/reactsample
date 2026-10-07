/**
 * Prints the Vitest coverage totals (coverage/coverage-summary.json) as a Markdown table.
 * The CI appends it to the job summary: node scripts/coverage-summary.mjs >> "$GITHUB_STEP_SUMMARY"
 */
import { readFileSync } from 'node:fs'

const { total } = JSON.parse(readFileSync('coverage/coverage-summary.json', 'utf8'))
const rows = ['statements', 'branches', 'functions', 'lines'].map(
  (key) => `| ${key} | ${total[key].pct} % | ${total[key].covered} / ${total[key].total} |`,
)
console.log(['### Coverage', '', '| | % | covered |', '|---|---:|---:|', ...rows].join('\n'))
