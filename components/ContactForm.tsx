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
    service: services[0].title,
    message: '',
  });
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [sent, setSent] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);

  const set = (field: Field, value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    // Clear an existing error as soon as it is fixed, but never introduce
    // a new one mid-keystroke.
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

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    setTouched({ name: true, phone: true, email: true, message: true });

    const keys = Object.keys(found) as Field[];
    if (keys.length) {
      // Multiple errors: focus the summary. It links to each invalid field.
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    const text = [
      `New enquiry from the Async Creation website`,
      ``,
      `Name: ${values.name}`,
      `Phone: ${values.phone}`,
      `Email: ${values.email}`,
      `Service: ${values.service}`,
      ``,
      `Details: ${values.message}`,
    ].join('\n');

    window.open(`https://wa.me/${site.phone.replace('+', '')}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    setSent(true);
  };

  const errorList = (Object.keys(errors) as Field[]).filter((k) => errors[k]);

  if (sent) {
    return (
      <div className="form-ok" role="status">
        <div>
          <h2 className="t-h3">Enquiry ready to send</h2>
          <p style={{ marginTop: '0.75rem', color: 'var(--color-muted)' }}>
            We opened WhatsApp with your details filled in — press send there and we will reply the same working day. If
            the window did not open, email us at{' '}
            <a href={site.mailto} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>
              {site.email}
            </a>
            .
          </p>
          <button type="button" className="btn btn-ghost" style={{ marginTop: '1.5rem' }} onClick={() => setSent(false)}>
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

      <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
        Send enquiry via WhatsApp
      </button>
      <p className="field-hint" style={{ marginTop: '1rem' }}>
        Opens WhatsApp with your details filled in. Prefer email?{' '}
        <a href={site.mailto} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline' }}>
          Write to {site.email}
        </a>
        .
      </p>
    </form>
  );
}
