/**
 * Ref callback for scroll containers: reachable with the keyboard (Tab, then arrow keys) while
 * their content overflows - WCAG 2.1.1. Containers that do not scroll get no extra tab stop.
 *
 *   <pre ref={focusableWhenScrolling} className="overflow-x-auto">…</pre>
 *
 * A plain function, so its identity is stable and React calls it only on mount and unmount.
 */
export function focusableWhenScrolling(element: HTMLElement | null) {
  if (!element) return
  const update = () => {
    const scrolls = element.scrollWidth > element.clientWidth + 1 || element.scrollHeight > element.clientHeight + 1
    if (scrolls) element.tabIndex = 0
    else element.removeAttribute('tabindex')
  }
  update()
  const resize = new ResizeObserver(update)
  resize.observe(element)
  const content = new MutationObserver(update)
  content.observe(element, { childList: true, subtree: true, characterData: true })
  return () => {
    resize.disconnect()
    content.disconnect()
  }
}
