import { useEffect } from 'react'

type HreflangProps = {
  links: { hreflang: string; href: string }[]
}

const Hreflang = ({ links }: HreflangProps) => {
  useEffect(() => {
    const elements: HTMLLinkElement[] = []
    for (const { hreflang, href } of links) {
      const link = document.createElement('link')
      link.rel = 'alternate'
      link.hreflang = hreflang
      link.href = href
      document.head.appendChild(link)
      elements.push(link)
    }
    return () => {
      for (const el of elements) {
        el.remove()
      }
    }
  }, [links])

  return null
}

export default Hreflang
