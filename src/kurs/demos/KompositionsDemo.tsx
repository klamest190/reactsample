import { useEffect, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Button, Code, Demo } from '../../components/Ui'
import { useSprache } from '../../i18n/SpracheContext'

/** Live-Demo (Kapitel 4.3): Slots, Render-Prop und Portal. */

const TEXTE = {
  de: {
    titel: 'Slots, Render-Prop & Portal (TypeScript)',
    einstellungen: 'Einstellungen',
    modalOeffnen: 'Modal öffnen',
    slotText: ['Alles zwischen den Tags landet in', '. Kopf und Aktionen sind eigene Slots.'],
    maus: 'Maus',
    modalTitel: 'Hallo aus dem Portal',
    modalText: ['Dieses Element hängt im DOM direkt unter', ', gehört im React-Baum aber zu diesem Kapitel. Escape schließt es.'],
    schliessen: 'Schließen',
  },
  en: {
    titel: 'Slots, render prop & portal (TypeScript)',
    einstellungen: 'Settings',
    modalOeffnen: 'Open modal',
    slotText: ['Everything between the tags ends up in', '. Header and actions are separate slots.'],
    maus: 'Mouse',
    modalTitel: 'Hello from the portal',
    modalText: ['In the DOM this element sits directly under', ', but in the React tree it belongs to this chapter. Escape closes it.'],
    schliessen: 'Close',
  },
}

function Panel({ kopf, aktionen, children }: { kopf: ReactNode; aktionen?: ReactNode; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
        <div className="text-sm font-semibold">{kopf}</div>
        {aktionen}
      </div>
      <div className="p-3 text-sm">{children}</div>
    </div>
  )
}

/** Render-Prop: kümmert sich um die Logik, der Aufrufer um die Darstellung. */
function MausPosition({ children }: { children: (position: { x: number; y: number }) => ReactNode }) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  return (
    <div
      onMouseMove={(e) => {
        const box = e.currentTarget.getBoundingClientRect()
        setPosition({ x: Math.round(e.clientX - box.left), y: Math.round(e.clientY - box.top) })
      }}
      className="rounded-lg bg-slate-100 p-6 text-center text-sm dark:bg-slate-800"
    >
      {children(position)}
    </div>
  )
}

function Modal({
  offen,
  beimSchliessen,
  titel,
  schliessenText,
  children,
}: {
  offen: boolean
  beimSchliessen: () => void
  titel: string
  schliessenText: string
  children: ReactNode
}) {
  useEffect(() => {
    if (!offen) return
    const beiTaste = (e: KeyboardEvent) => e.key === 'Escape' && beimSchliessen()
    window.addEventListener('keydown', beiTaste)
    return () => window.removeEventListener('keydown', beiTaste)
  }, [offen, beimSchliessen])

  if (!offen) return null

  // Das Markup landet direkt unter <body> - kein overflow:hidden der Eltern stört.
  // Events sprudeln trotzdem durch den REACT-Baum nach oben.
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={beimSchliessen}
      role="dialog"
      aria-modal="true"
      aria-label={titel}
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-xl bg-white p-4 shadow-xl dark:bg-slate-900">
        <h3 className="mb-2 text-lg font-semibold">{titel}</h3>
        <div className="text-sm text-slate-600 dark:text-slate-300">{children}</div>
        <Button className="mt-4" onClick={beimSchliessen}>
          {schliessenText}
        </Button>
      </div>
    </div>,
    document.body,
  )
}

export function KompositionsDemo() {
  const t = TEXTE[useSprache().sprache]
  const [modalOffen, setModalOffen] = useState(false)

  return (
    <Demo titel={t.titel}>
      <Panel
        kopf={t.einstellungen}
        aktionen={
          <Button variante="sekundaer" onClick={() => setModalOffen(true)}>
            {t.modalOeffnen}
          </Button>
        }
      >
        {t.slotText[0]} <Code>children</Code>
        {t.slotText[1]}
      </Panel>
      <MausPosition>
        {({ x, y }) => (
          <span className="font-mono">
            {t.maus}: x={x} y={y}
          </span>
        )}
      </MausPosition>
      <Modal
        offen={modalOffen}
        beimSchliessen={() => setModalOffen(false)}
        titel={t.modalTitel}
        schliessenText={t.schliessen}
      >
        {t.modalText[0]} <Code>body</Code>
        {t.modalText[1]}
      </Modal>
    </Demo>
  )
}
