'use client';

import { useState } from 'react';

const STAR = 'M12 2.5l2.95 6.28 6.83.77-5.1 4.72 1.4 6.79L12 17.9l-6.08 3.16 1.4-6.79-5.1-4.72 6.83-.77L12 2.5z';
const RATING_LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

export default function TestimonialForm() {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [quote, setQuote] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [website, setWebsite] = useState(''); // honeypot — real visitors leave this blank
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const shown = hoverRating || rating;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) return setError('Please add your name.');
    if (!rating) return setError('Please choose a star rating.');
    if (quote.trim().length < 10) return setError('Please write a little more about your experience.');

    setSubmitting(true);
    try {
      const res = await fetch('/api/testimonials-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), role: role.trim(), rating, quote: quote.trim(), website }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not submit your feedback. Please try again.');
      setSent(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="form-ok" role="status">
        <div>
          <h2 className="t-h3">Thank you for the feedback</h2>
          <p style={{ marginTop: '0.75rem', color: 'var(--color-muted)' }}>
            Your review has been submitted and will appear on this page once our team approves it.
          </p>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ marginTop: '1.5rem' }}
            onClick={() => {
              setSent(false);
              setName('');
              setRole('');
              setQuote('');
              setRating(0);
            }}
          >
            Submit another review
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      {/* Hidden from sighted users and skipped by real visitors; bots that
          auto-fill every field trip it. */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: 0, height: 0, overflow: 'hidden' }}>
        <label htmlFor="tf-website">Leave this field empty</label>
        <input
          id="tf-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="tf-name">
          Your name <span className="req">*</span>
        </label>
        <input
          id="tf-name"
          type="text"
          autoComplete="name"
          maxLength={80}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="field">
        <label htmlFor="tf-role">Company / role (optional)</label>
        <input
          id="tf-role"
          type="text"
          maxLength={80}
          placeholder="e.g. Founder, XYZ Studio"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="tf-rating-1">
          Your rating <span className="req">*</span>
        </label>
        <div className="star-picker" role="radiogroup" aria-label="Star rating" onMouseLeave={() => setHoverRating(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              id={`tf-rating-${n}`}
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n > 1 ? 's' : ''}`}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHoverRating(n)}
              onFocus={() => setHoverRating(n)}
              onBlur={() => setHoverRating(0)}
              style={{ color: n <= shown ? 'var(--color-clay)' : 'var(--color-muted-dark)' }}
            >
              <svg
                viewBox="0 0 24 24"
                width="30"
                height="30"
                fill={n <= shown ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d={STAR} />
              </svg>
            </button>
          ))}
          <span className="star-picker-label">{shown ? RATING_LABELS[shown] : ''}</span>
        </div>
      </div>

      <div className="field">
        <label htmlFor="tf-quote">
          Your feedback <span className="req">*</span>
        </label>
        <textarea
          id="tf-quote"
          maxLength={600}
          placeholder="Tell us about working with Async Creation — what stood out, what you'd tell a friend."
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          required
        />
        <span className="field-hint">{quote.length}/600</span>
      </div>

      {error && (
        <p className="field-error" role="alert" style={{ marginBottom: '1rem' }}>
          {error}
        </p>
      )}

      <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={submitting}>
        {submitting ? 'Submitting…' : 'Submit your review'}
      </button>
      <p className="field-hint" style={{ marginTop: '1rem' }}>
        Reviews are checked by our team before they appear on this page.
      </p>
    </form>
  );
}
