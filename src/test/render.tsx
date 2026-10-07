import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'

import { FortschrittProvider } from '../context/ProgressContext'
import { KapitelIdProvider } from '../context/ChapterContext'
import { SpracheProvider } from '../i18n/LanguageContext'

/**
 * Renders UI inside the app's providers, in English. `chapterId` puts it into a chapter like on a
 * chapter page (the quiz saves its state per chapter).
 */
export function renderInApp(ui: ReactElement, { chapterId, ...options }: { chapterId?: string } & RenderOptions = {}) {
  localStorage.setItem('sprache', JSON.stringify('en'))
  function Providers({ children }: { children: ReactNode }) {
    const content = chapterId ? <KapitelIdProvider id={chapterId}>{children}</KapitelIdProvider> : children
    return (
      <SpracheProvider>
        <FortschrittProvider>{content}</FortschrittProvider>
      </SpracheProvider>
    )
  }
  return render(ui, { wrapper: Providers, ...options })
}
