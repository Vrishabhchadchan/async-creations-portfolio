'use client';

import { useRef, useState } from 'react';
import { services, site } from '@/lib/site';

type Field = 'name' | 'phone' | 'email' | 'service' | 'message';
type Errors = Partial<Record<Field, string>>;

const LABELS: Record<Field, string> = {
  name: 'Full name',
  phone: 'Phone number',
  email: 'Email address',
  service: 'Service needed',
  message: 'Project details',
};

const WEB3FORMS_KEY = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY || '86c446eb-7555-4a51-b1dd-efd342fb9bcd';

function validate(values: Record<Field, string>): Errors {
  const errors: Errors = {};

  if (!values.name.trim()) errors.name = 'Enter your name so we know who we are replying to.';

  const digits = values.phone.replace(/\D/g, '');
  if (!values.phone.trim()) errors.phone = 'Enter a phone number we can reach you on.';
  else if (digits.length < 10) errors.phone = 'That number looks too short — include all 10 digits.';

  if (!values.email.trim()) errors.email = 'Enter an email address for the written quote.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim()))
    errors.email = 'That email address is missing an @ or a domain.';

  if (!values.message.trim()) errors.message = 'Tell us briefly what you need, so the quote is accurate.';
  else if (values.message.trim().length < 15)
    errors.message = 'Add a little more detail — shoot type, date or location helps.';

  return errors;
}

export default function ContactForm() {
  const [values, setValues] = useState<Record<Field, string>>({
    name: '',
    phone: '',
    email: '',
    service: services[0]?.title || 'Photography & Videography',
    message: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const summaryRef = useRef<HTMLDivElement>(null);

  const set = (field: Field, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    if (errors[field]) {
      const next = validate({ ...values, [field]: value });
      if (!next[field]) setErrors((e) => ({ ...e, [field]: undefined }));
    }
  };

  const onBlur = (field: Field) => {
    setTouched((t) => ({ ...t, [field]: true }));
    const next = validate(values);
    setErrors((e) => ({ ...e, [field]: next[field] }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    setTouched({ name: true, phone: true, email: true, message: true });
    setSubmitError('');

    const keys = Object.keys(found) as Field[];
    if (keys.length) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    setSending(true);

    try {
      const formData = new FormData();
      formData.append('access_key', WEB3FORMS_KEY);
      formData.append('name', values.name.trim());
      formData.append('phone', values.phone.trim());
      formData.append('email', values.email.trim());
      formData.append('service', values.service);
      formData.append('message', values.message.trim());
      formData.append('subject', `New Project Enquiry: ${values.name.trim()} — ${values.service}`);
      formData.append('from_name', 'Async Creations Website');

      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setSent(true);
      } else {
        setSubmitError(
          data.message || 'Something went wrong — please try again or contact us via WhatsApp.'
        );
      }
    } catch {
      setSubmitError(
        'Could not send right now. Please try again or message us directly via WhatsApp.'
      );
    } finally {
      setSending(false);
    }
  };

  const openWhatsApp = () => {
    const text = [
      `New enquiry from the Async Creations website`,
      ``,
      `Name: ${values.name}`,
      `Phone: ${values.phone}`,
      `Email: ${values.email}`,
      `Service: ${values.service}`,
      ``,
      `Details: ${values.message}`,
    ].join('\n');
    window.open(
      `https://wa.me/${site.phone.replace('+', '')}?text=${encodeURIComponent(text)}`,
      '_blank',
      'noopener'
    );
  };

  const errorList = (Object.keys(errors) as Field[]).filter((k) => errors[k]);

  if (sent) {
    return (
      <div className="form-ok" role="status">
        <div>
          <h2 className="t-h3">Enquiry sent!</h2>
          <p style={{ marginTop: '0.75rem', color: 'var(--color-muted)' }}>
            We have received your details and will reply the same working day. If you need an
            immediate response, message us on{' '}
            <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>
              WhatsApp
            </a>
            .
          </p>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ marginTop: '1.5rem' }}
            onClick={() => {
              setSent(false);
              setSubmitError('');
            }}
          >
            Send another enquiry
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      {errorList.length > 1 && (
        <div className="error-summary" tabIndex={-1} ref={summaryRef} role="alert" aria-labelledby="err-title">
          <h2 id="err-title">There are {errorList.length} things to fix</h2>
          <ul>
            {errorList.map((k) => (
              <li key={k}>
                <a href={`#cf-${k}`}>{errors[k]}</a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="form-row">
        {(['name', 'phone'] as Field[]).map((f) => (
          <div className="field" key={f}>
            <label htmlFor={`cf-${f}`}>
              {LABELS[f]} <span className="req">*</span>
            </label>
            <input
              id={`cf-${f}`}
              name={f}
              type={f === 'phone' ? 'tel' : 'text'}
              inputMode={f === 'phone' ? 'tel' : undefined}
              autoComplete={f === 'phone' ? 'tel' : 'name'}
              value={values[f]}
              onChange={(e) => set(f, e.target.value)}
              onBlur={() => onBlur(f)}
              aria-invalid={touched[f] && !!errors[f]}
              aria-describedby={errors[f] ? `err-${f}` : undefined}
              required
            />
            {touched[f] && errors[f] && (
              <span className="field-error" id={`err-${f}`}>
                {errors[f]}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="field">
        <label htmlFor="cf-email">
          {LABELS.email} <span className="req">*</span>
        </label>
        <input
          id="cf-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          value={values.email}
          onChange={(e) => set('email', e.target.value)}
          onBlur={() => onBlur('email')}
          aria-invalid={touched.email && !!errors.email}
          aria-describedby={errors.email ? 'err-email' : undefined}
          required
        />
        {touched.email && errors.email && (
          <span className="field-error" id="err-email">
            {errors.email}
          </span>
        )}
      </div>

      <div className="field">
        <label htmlFor="cf-service">{LABELS.service}</label>
        <select
          id="cf-service"
          name="service"
          value={values.service}
          onChange={(e) => set('service', e.target.value)}
        >
          {services.map((s) => (
            <option key={s.slug}>{s.title}</option>
          ))}
          <option>Something else</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="cf-message">
          {LABELS.message} <span className="req">*</span>
        </label>
        <textarea
          id="cf-message"
          name="message"
          value={values.message}
          onChange={(e) => set('message', e.target.value)}
          onBlur={() => onBlur('message')}
          aria-invalid={touched.message && !!errors.message}
          aria-describedby={errors.message ? 'err-message' : 'hint-message'}
          required
        />
        {touched.message && errors.message ? (
          <span className="field-error" id="err-message">
            {errors.message}
          </span>
        ) : (
          <span className="field-hint" id="hint-message">
            Shoot type, approximate date, location and budget range all help us quote accurately.
          </span>
        )}
      </div>

      {/* Honeypot — hidden from real users */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }} aria-hidden="true">
        <label htmlFor="cf-botcheck">Don't fill this out</label>
        <input id="cf-botcheck" name="botcheck" type="checkbox" tabIndex={-1} autoComplete="off" />
      </div>

      {submitError && (
        <p className="field-error" role="alert" style={{ marginBottom: '1rem' }}>
          {submitError}{' '}
          <button
            type="button"
            onClick={openWhatsApp}
            style={{
              textDecoration: 'underline',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              font: 'inherit',
              color: 'inherit',
              padding: 0,
            }}
          >
            Send via WhatsApp instead
          </button>
        </p>
      )}

      <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={sending}>
        {sending ? 'Sending…' : 'Send enquiry'}
      </button>
      <p className="field-hint" style={{ marginTop: '1rem' }}>
        Your enquiry goes directly to our inbox. Prefer WhatsApp?{' '}
        <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>
          Message us directly
        </a>
        .
      </p>
    </form>
  );
}
