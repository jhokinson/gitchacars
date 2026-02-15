import { useEffect, useRef, useCallback } from 'react'

export default function useScrollReveal(containerRef) {
  const observerRef = useRef(null)
  const mutationRef = useRef(null)

  const revealInViewport = useCallback((elements) => {
    elements.forEach((el, i) => {
      if (!el.style.transitionDelay) {
        el.style.transitionDelay = `${Math.min(i * 50, 300)}ms`
      }
      const rect = el.getBoundingClientRect()
      if (rect.top < window.innerHeight + 50) {
        el.classList.add('revealed')
      } else if (observerRef.current) {
        observerRef.current.observe(el)
      }
    })
  }, [])

  useEffect(() => {
    if (!containerRef?.current) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReduced) {
      containerRef.current.querySelectorAll('.scroll-reveal').forEach((el) => {
        el.classList.add('revealed')
      })
      // Watch for new elements too
      mutationRef.current = new MutationObserver(() => {
        containerRef.current?.querySelectorAll('.scroll-reveal:not(.revealed)').forEach((el) => {
          el.classList.add('revealed')
        })
      })
      mutationRef.current.observe(containerRef.current, { childList: true, subtree: true })
      return () => mutationRef.current?.disconnect()
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observerRef.current?.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    )

    // Handle initial elements
    const initialElements = containerRef.current.querySelectorAll('.scroll-reveal:not(.revealed)')
    revealInViewport(Array.from(initialElements))

    // Watch for dynamically added elements (e.g., async data loading)
    mutationRef.current = new MutationObserver(() => {
      const newElements = containerRef.current?.querySelectorAll('.scroll-reveal:not(.revealed)')
      if (newElements?.length) {
        revealInViewport(Array.from(newElements))
      }
    })
    mutationRef.current.observe(containerRef.current, { childList: true, subtree: true })

    return () => {
      observerRef.current?.disconnect()
      mutationRef.current?.disconnect()
    }
  }, [containerRef, revealInViewport])
}
