import { ImageResponse } from 'next/og';
import { site } from '@/lib/site';

export const alt = `${site.name} — ${site.role} in ${site.city}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#16120e',
          padding: '72px',
          fontFamily: 'serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, background: '#c2612f' }} />
          <div
            style={{
              color: '#e08a4f',
              fontSize: 22,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              fontFamily: 'sans-serif',
            }}
          >
            {site.role}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ color: '#f5f0e8', fontSize: 132, lineHeight: 1, letterSpacing: '-0.04em' }}>We Create.</div>
          <div
            style={{
              color: '#e08a4f',
              fontSize: 132,
              lineHeight: 1,
              letterSpacing: '-0.04em',
              fontStyle: 'italic',
            }}
          >
            You Grow.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            borderTop: '1px solid rgba(245,240,232,0.18)',
            paddingTop: '28px',
            color: '#a99c8c',
            fontSize: 24,
            fontFamily: 'sans-serif',
          }}
        >
          <div style={{ display: 'flex', color: '#f5f0e8', letterSpacing: '0.1em' }}>ASYNC CREATION</div>
          <div style={{ display: 'flex' }}>
            {site.city}, {site.state} · India
          </div>
        </div>
      </div>
    ),
    size
  );
}
