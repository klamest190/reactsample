import type * as Monaco from 'monaco-editor'

/**
 * Two Monaco themes matching the page's colour scheme.
 *
 * The colours are the same ones the own highlighter uses (COLORS in highlight.tsx), only
 * as hex instead of Tailwind classes: the `-700` steps on white, the `-300`/`-400` steps
 * on slate-900. That is not a matter of taste but a requirement - `npm run e2e:pages`
 * runs axe-core over every page and Monaco's DOM is not excluded, so its text has to
 * reach 4.5:1 (CLAUDE.md, "Kontrast").
 *
 * The background has to match the surface the editor sits on (EditorFrame:
 * `bg-white dark:bg-slate-900`), otherwise axe measures against the wrong base.
 *
 * The values are computed against the *worst* background, the highlighted active line -
 * not against the normal surface. Otherwise the line under the cursor is exactly the one
 * that fails the check. `themes.test.ts` keeps that honest.
 */

/** Name of the light theme - passed to Monaco, never translated. */
export const THEME_LIGHT = 'lernpfad-light'
/** Name of the dark theme. */
export const THEME_DARK = 'lernpfad-dark'

export type ThemeColors = {
  foreground: string
  background: string
  comment: string
  string: string
  keyword: string
  number: string
  tag: string
  fn: string
  type: string
  lineNumber: string
  lineNumberActive: string
  selection: string
  activeLine: string
}

export const LIGHT: ThemeColors = {
  foreground: '0F172A', // slate-900
  background: 'FFFFFF',
  comment: '475569', // slate-600
  string: '065F46', // emerald-800
  keyword: '6D28D9', // violet-700
  number: '92400E', // amber-800
  tag: 'BE123C', // rose-700
  fn: '0369A1', // sky-700
  type: '0F766E', // teal-700
  lineNumber: '475569', // slate-600 - axe counts line numbers as text
  lineNumberActive: '0F172A', // slate-900
  selection: 'BFDBFE', // blue-200
  activeLine: 'F8FAFC', // slate-50 - lighter than slate-100, which would break the contrast
}

export const DARK: ThemeColors = {
  foreground: 'F1F5F9', // slate-100
  background: '0F172A', // slate-900 - same as the frame's card
  comment: '94A3B8', // slate-400
  string: '34D399', // emerald-400
  keyword: 'A78BFA', // violet-400
  number: 'FBBF24', // amber-400
  tag: 'FB7185', // rose-400
  fn: '38BDF8', // sky-400
  type: '5EEAD4', // teal-300
  lineNumber: '94A3B8', // slate-400 - slate-500 is not enough on slate-900
  lineNumberActive: 'E2E8F0', // slate-200
  selection: '1E40AF', // blue-800
  activeLine: '1E293B', // slate-800
}

/**
 * Map Monaco's token names onto our colours.
 *
 * The names come from each language's tokenizer - `type.identifier` only exists in Java,
 * `attribute.name` only in YAML/Dockerfile. Unknown names do no harm, Monaco ignores them.
 */
function rules(colors: ThemeColors): Monaco.editor.ITokenThemeRule[] {
  return [
    { token: '', foreground: colors.foreground },
    { token: 'comment', foreground: colors.comment, fontStyle: 'italic' },
    { token: 'string', foreground: colors.string },
    { token: 'string.sql', foreground: colors.string },
    { token: 'string.yaml', foreground: colors.string },
    { token: 'keyword', foreground: colors.keyword },
    { token: 'keyword.json', foreground: colors.keyword },
    { token: 'number', foreground: colors.number },
    { token: 'constant', foreground: colors.number },
    { token: 'regexp', foreground: colors.tag },
    { token: 'delimiter.html', foreground: colors.tag },
    { token: 'tag', foreground: colors.tag },
    { token: 'metatag', foreground: colors.tag },
    { token: 'annotation', foreground: colors.number },
    { token: 'type', foreground: colors.type },
    { token: 'type.identifier', foreground: colors.type },
    { token: 'identifier', foreground: colors.foreground },
    { token: 'attribute.name', foreground: colors.fn },
    { token: 'attribute.value', foreground: colors.string },
    { token: 'key', foreground: colors.fn },
    { token: 'operators', foreground: colors.foreground },
    { token: 'predefined', foreground: colors.fn },
    { token: 'predefined.sql', foreground: colors.fn },
    { token: 'operator.sql', foreground: colors.keyword },
    { token: 'keyword.flow', foreground: colors.keyword },
  ]
}

function uiColors(colors: ThemeColors): Record<string, string> {
  return {
    'editor.background': '#' + colors.background,
    'editor.foreground': '#' + colors.foreground,
    'editorLineNumber.foreground': '#' + colors.lineNumber,
    'editorLineNumber.activeForeground': '#' + colors.lineNumberActive,
    'editor.selectionBackground': '#' + colors.selection,
    'editor.lineHighlightBackground': '#' + colors.activeLine,
    'editorIndentGuide.background1': '#' + colors.lineNumber + '40',
    'editorGutter.background': '#' + colors.background,
    'editorWidget.background': '#' + colors.background,
    'editorSuggestWidget.background': '#' + colors.background,
    'editorSuggestWidget.foreground': '#' + colors.foreground,
    'editorHoverWidget.background': '#' + colors.background,
    'editorOverviewRuler.border': '#00000000',
  }
}

/** Register both themes - once per Monaco instance. */
export function registerThemes(monaco: typeof Monaco) {
  monaco.editor.defineTheme(THEME_LIGHT, { base: 'vs', inherit: true, rules: rules(LIGHT), colors: uiColors(LIGHT) })
  monaco.editor.defineTheme(THEME_DARK, { base: 'vs-dark', inherit: true, rules: rules(DARK), colors: uiColors(DARK) })
}
