import Pagina from './Pagina'

export type Tarjeta = {
  nombre: string
  descripcion: string
}

type PaginaTarjetasProps = {
  titulo: string
  descripcion: string
  tarjetas: Tarjeta[]
}

const PaginaTarjetas = ({ titulo, descripcion, tarjetas }: PaginaTarjetasProps) => {
  return (
    <Pagina>
      <header className='mb-8'>
        <h1 className='text-3xl font-bold'>{titulo}</h1>
        <p className='text-base-content/70 mt-2'>{descripcion}</p>
      </header>

      <div className='grid w-full gap-6 sm:grid-cols-2'>
        {tarjetas.map((tarjeta) => (
          <div key={tarjeta.nombre} className='card card-motion bg-base-200 shadow-sm'>
            <div className='card-body'>
              <h2 className='card-title text-lg'>{tarjeta.nombre}</h2>
              <p className='text-base-content/80'>{tarjeta.descripcion}</p>
            </div>
          </div>
        ))}
      </div>
    </Pagina>
  )
}

export default PaginaTarjetas
