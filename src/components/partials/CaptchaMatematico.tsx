import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRotateRight } from '@fortawesome/free-solid-svg-icons'

export type PreguntaCaptcha = {
  a: number
  b: number
  respuesta: number
}

export function nuevaPreguntaCaptcha(): PreguntaCaptcha {
  const a = Math.floor(Math.random() * 9) + 1
  const b = Math.floor(Math.random() * 9) + 1
  return { a, b, respuesta: a + b }
}

type CaptchaMatematicoProps = {
  valor: string
  onChange: (valor: string) => void
  error?: string
  disabled?: boolean
  pregunta: PreguntaCaptcha | null
  onRegenerar: () => void
}

const CaptchaMatematico = ({
  valor,
  onChange,
  error,
  disabled,
  pregunta,
  onRegenerar,
}: CaptchaMatematicoProps) => {
  const { t } = useTranslation()

  return (
    <div className='form-control w-full gap-1.5'>
      <span className='label'>
        <span className='label-text'>
          {t('contact.captcha.label')} <span className='text-error'>*</span>
        </span>
        <button
          type='button'
          className='btn btn-ghost btn-xs gap-1'
          onClick={onRegenerar}
          disabled={disabled || !pregunta}
          aria-label={t('contact.captcha.ariaRefresh')}
        >
          <FontAwesomeIcon icon={faRotateRight} className='text-xs' />
          {t('contact.captcha.another')}
        </button>
      </span>

      {pregunta ? (
        <p className='text-sm text-base-content/80 mb-2' id='captcha-descripcion'>
          {t('contact.captcha.question', { a: pregunta.a, b: pregunta.b })}
        </p>
      ) : (
        <div className='skeleton mb-2 h-5 w-40' aria-hidden='true' />
      )}

      <input
        type='text'
        inputMode='numeric'
        pattern='[0-9]*'
        name='captcha-respuesta'
        autoComplete='off'
        required
        disabled={disabled || !pregunta}
        value={valor}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
        className={`input input-bordered input-sm input-motion w-full ${error ? 'input-error' : ''}`}
        placeholder={t('contact.captcha.placeholder')}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? 'captcha-error captcha-descripcion' : 'captcha-descripcion'}
      />

      {error && (
        <p id='captcha-error' className='text-error text-sm mt-1' role='alert'>
          {error}
        </p>
      )}
    </div>
  )
}

export function useCaptchaMatematico() {
  const [pregunta, setPregunta] = useState<PreguntaCaptcha | null>(null)

  useEffect(() => {
    setPregunta(nuevaPreguntaCaptcha())
  }, [])

  const regenerar = () => setPregunta(nuevaPreguntaCaptcha())

  return { pregunta, regenerar }
}

export default CaptchaMatematico
