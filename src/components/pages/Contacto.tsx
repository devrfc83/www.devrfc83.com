import { type FormEvent, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import Pagina from '../partials/Pagina'
import CaptchaMatematico, { useCaptchaMatematico } from '../partials/CaptchaMatematico'

const FORM_NAME = 'contacto'

type EstadoEnvio = 'idle' | 'enviando' | 'exito' | 'error'

const Contacto = () => {
  const { t } = useTranslation()
  const [estado, setEstado] = useState<EstadoEnvio>('idle')
  const [captchaValor, setCaptchaValor] = useState('')
  const [captchaError, setCaptchaError] = useState('')
  const { pregunta: captcha, regenerar: regenerarCaptcha } = useCaptchaMatematico()

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCaptchaError('')

    if (!captcha) {
      setCaptchaError(t('contact.captcha.wait'))
      return
    }

    if (Number(captchaValor) !== captcha.respuesta) {
      setCaptchaError(t('contact.captcha.wrong'))
      setCaptchaValor('')
      regenerarCaptcha()
      return
    }

    setEstado('enviando')

    const form = event.currentTarget
    const datos = new FormData(form)

    const campos = [...datos.entries()].filter(([clave]) => clave !== 'captcha-respuesta')

    try {
      const respuesta = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(campos.map(([clave, valor]) => [clave, String(valor)])).toString(),
      })

      if (!respuesta.ok) {
        throw new Error('Error al enviar el formulario')
      }

      form.reset()
      setCaptchaValor('')
      regenerarCaptcha()
      setEstado('exito')
    } catch {
      setEstado('error')
    }
  }

  return (
    <Pagina>
      <div className='animate-page-in mx-auto flex w-full max-w-md flex-col items-center'>
        <header className='mb-8 w-full text-center'>
          <h1 className='text-3xl font-bold'>{t('contact.title')}</h1>
          <p className='text-base-content/70 mt-2 text-sm'>
            <Trans i18nKey='contact.intro' components={{ required: <span className='text-error' /> }} />
          </p>
        </header>

        {estado === 'exito' && (
          <div role='alert' className='alert alert-success mb-6 w-full text-sm animate-page-in'>
            <span>{t('contact.success')}</span>
          </div>
        )}

        {estado === 'error' && (
          <div role='alert' className='alert alert-error mb-6 w-full text-sm animate-page-in'>
            <span>{t('contact.error')}</span>
          </div>
        )}

        <form
          name={FORM_NAME}
          method='POST'
          data-netlify='true'
          data-netlify-honeypot='bot-field'
          onSubmit={handleSubmit}
          className='card form-card-motion bg-base-200 flex w-full flex-col gap-4 rounded-2xl p-6 shadow-sm'
        >
          <input type='hidden' name='form-name' value={FORM_NAME} />

          <p className='hidden' aria-hidden='true'>
            <label>
              {t('contact.honeypot')} <input name='bot-field' tabIndex={-1} autoComplete='off' />
            </label>
          </p>

          <label className='form-control w-full gap-1.5'>
            <span className='label'>
              <span className='label-text'>
                {t('contact.name')} <span className='text-error'>*</span>
              </span>
            </span>
            <input
              type='text'
              name='nombre'
              required
              autoComplete='name'
              disabled={estado === 'enviando'}
              className='input input-bordered input-sm input-motion w-full'
              placeholder={t('contact.placeholders.name')}
            />
          </label>

          <label className='form-control w-full gap-1.5'>
            <span className='label'>
              <span className='label-text'>
                {t('contact.email')} <span className='text-error'>*</span>
              </span>
            </span>
            <input
              type='email'
              name='email'
              required
              autoComplete='email'
              disabled={estado === 'enviando'}
              className='input input-bordered input-sm input-motion w-full'
              placeholder={t('contact.placeholders.email')}
            />
          </label>

          <label className='form-control w-full gap-1.5'>
            <span className='label'>
              <span className='label-text'>{t('contact.subject')}</span>
            </span>
            <input
              type='text'
              name='asunto'
              disabled={estado === 'enviando'}
              className='input input-bordered input-sm input-motion w-full'
              placeholder={t('contact.placeholders.subject')}
            />
          </label>

          <label className='form-control w-full gap-1.5'>
            <span className='label'>
              <span className='label-text'>
                {t('contact.message')} <span className='text-error'>*</span>
              </span>
            </span>
            <textarea
              name='mensaje'
              required
              rows={5}
              disabled={estado === 'enviando'}
              className='textarea textarea-bordered textarea-sm input-motion w-full'
              placeholder={t('contact.placeholders.message')}
            />
          </label>

          <CaptchaMatematico
            valor={captchaValor}
            onChange={setCaptchaValor}
            error={captchaError}
            disabled={estado === 'enviando'}
            pregunta={captcha}
            onRegenerar={() => {
              setCaptchaError('')
              setCaptchaValor('')
              regenerarCaptcha()
            }}
          />

          <button
            type='submit'
            disabled={estado === 'enviando' || !captcha}
            className='btn btn-primary btn-sm btn-motion w-full gap-2'
          >
            {estado === 'enviando' ? (
              <>
                <span className='loading loading-spinner loading-sm' />
                {t('contact.sending')}
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faPaperPlane} />
                {t('contact.submit')}
              </>
            )}
          </button>
        </form>
      </div>
    </Pagina>
  )
}

export default Contacto
