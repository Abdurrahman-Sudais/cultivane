import { useEffect, useRef, useState } from 'react'

const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * Reveals every `.reveal` / `.draw` element as it scrolls into view, including ones mounted later.
 * Also feeds the pointer position to `.spot` cards for their hover spotlight.
 */
export function useRevealOnScroll(key: string) {
  useEffect(() => {
    const show = (el: Element) => el.classList.add('in')
    if (reduced() || !('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal, .draw').forEach(show)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            show(e.target)
            io.unobserve(e.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )
    const scan = () => document.querySelectorAll('.reveal:not(.in), .draw:not(.in)').forEach((el) => io.observe(el))
    scan()
    const mo = new MutationObserver(scan)
    mo.observe(document.body, { childList: true, subtree: true })
    // Fallback: fast scrolling or jumping to an anchor can skip past an element without an intersection
    // event. Anything at or above the bottom of the viewport is revealed, so content is never left hidden.
    let raf = 0
    const sweep = () => {
      raf = 0
      const limit = window.innerHeight
      document.querySelectorAll('.reveal:not(.in), .draw:not(.in)').forEach((el) => {
        if (el.getBoundingClientRect().top < limit) {
          show(el)
          io.unobserve(el)
        }
      })
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(sweep)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    const late = window.setTimeout(sweep, 300)
    return () => {
      io.disconnect()
      mo.disconnect()
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      window.clearTimeout(late)
      cancelAnimationFrame(raf)
    }
  }, [key])

  useEffect(() => {
    const move = (e: PointerEvent) => {
      const card = (e.target as Element | null)?.closest?.('.spot') as HTMLElement | null
      if (!card) return
      const r = card.getBoundingClientRect()
      card.style.setProperty('--mx', `${e.clientX - r.left}px`)
      card.style.setProperty('--my', `${e.clientY - r.top}px`)
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [])
}

/** Counts from 0 to `to` the first time the returned ref scrolls into view. */
export function useCountUp<T extends HTMLElement>(to: number, ms = 1600) {
  const ref = useRef<T>(null)
  const [value, setValue] = useState(() => (reduced() ? to : 0))
  useEffect(() => {
    const el = ref.current
    if (!el || reduced() || !('IntersectionObserver' in window)) {
      setValue(to)
      return
    }
    let raf = 0
    const io = new IntersectionObserver(([e]) => {
      if (!e?.isIntersecting) return
      io.disconnect()
      const start = performance.now()
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / ms)
        setValue(to * (1 - Math.pow(1 - p, 3)))
        if (p < 1) raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)
    }, { threshold: 0.4 })
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [to, ms])
  return [ref, value] as const
}

/** Cycles through `items` every `ms`, unless the visitor prefers reduced motion. */
export function useCycle<T>(items: readonly T[], ms = 2600) {
  const [i, setI] = useState(0)
  useEffect(() => {
    if (reduced()) return
    const t = window.setInterval(() => setI((n) => (n + 1) % items.length), ms)
    return () => window.clearInterval(t)
  }, [items.length, ms])
  return items[i]
}
