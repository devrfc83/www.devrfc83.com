import type { ReactNode } from 'react'

type PaginaProps = {
  children: ReactNode
  className?: string
  centrado?: boolean
}

const Pagina = ({ children, className = '', centrado = false }: PaginaProps) => {
  return (
    <article
      className={`w-full pt-8 pb-14 ${centrado ? 'flex flex-1 flex-col items-center justify-center' : ''} ${className}`.trim()}
    >
      {children}
    </article>
  )
}

export default Pagina
