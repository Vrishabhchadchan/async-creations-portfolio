'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { CustomEase } from 'gsap/CustomEase';

/**
 * Scroll choreography for the whole site.
 *
 * Everything animates with gsap.from()/fromTo() off the CSS resting
 * state, so the served HTML is already complete and visible — the motion
 * is added on top once JS runs, never required to reveal content.
 *
 * Markup hooks:
 *   data-split="lines|words|chars"  masked type reveal
 *   data-reveal                     fade + rise
 *   data-reveal-stagger             sequence direct children
 *   data-parallax="-12"             drift across the viewport
 *   data-bg="bone|ink|clay|sand"    morph the page backdrop
 *   data-marquee                    scroll-velocity driven strip
 *   data-magnetic                   pointer-attracted control
 *   data-count="150"                count up
 *   data-draw                       draw an SVG line
 */
export default function MotionEngine() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);

    CustomEase.create('swift', '0.16, 1, 0.3, 1');
    CustomEase.create('mask', '0.65, 0, 0.35, 1');

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const splits: SplitText[] = [];

    // Hands CSS fallbacks (like the marquee keyframes) over to GSAP.
    document.documentElement.classList.add('js-motion');

    const ctx = gsap.context(() => {
      /* ---------------- Backdrop colour journey ----------------
         Sections declare the palette they sit on; the fixed backdrop
         scrubs between them so the page shifts colour as you travel. */
      /* Only light tones live here. Dark chapters paint their own solid
         background instead, because a backdrop that flips to ink while
         the outgoing light section is still on screen would briefly put
         dark text on a dark field. */
      const PALETTE: Record<string, string> = {
        bone: '#f5f0e8',
        sand: '#ece0cc',
        cream: '#f6e9d8',
        blush: '#f0e2da',
        moss: '#e6e6da',
      };

      gsap.utils.toArray<HTMLElement>('[data-bg]').forEach((section) => {
        const bg = PALETTE[section.dataset.bg || 'bone'];
        if (!bg) return;
        // Boundaries meet exactly at mid-viewport — one section's end is
        // the next one's start — so only ever one is active and the
        // colour always matches the section you are looking at.
        ScrollTrigger.create({
          trigger: section,
          start: 'top 50%',
          end: 'bottom 50%',
          onToggle: ({ isActive }) => {
            if (!isActive) return;
            gsap.to('#backdrop', { backgroundColor: bg, duration: 0.9, ease: 'power2.out' });
          },
        });
      });

      if (reduced) return;

      /* ---------------- Masked type reveals ----------------
         SplitText's mask option wraps each line so it can rise out of
         its own clipping box — the reveal reads as type being printed
         rather than fading in. */
      gsap.utils.toArray<HTMLElement>('[data-split]').forEach((el) => {
        const kind = el.dataset.split || 'lines';
        const split = new SplitText(el, {
          type: kind === 'chars' ? 'chars,words' : kind === 'words' ? 'words,lines' : 'lines',
          mask: kind === 'chars' ? 'chars' : kind === 'words' ? 'words' : 'lines',
          linesClass: 'split-line',
        });
        splits.push(split);

        const targets = kind === 'chars' ? split.chars : kind === 'words' ? split.words : split.lines;
        if (!targets?.length) return;

        gsap.from(targets, {
          yPercent: 118,
          rotate: kind === 'chars' ? 6 : 2,
          duration: kind === 'chars' ? 0.85 : 1.05,
          ease: 'swift',
          stagger: kind === 'chars' ? 0.022 : 0.085,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      });

      /* ---------------- Hero exit ----------------
         The copy drifts and dims as the camera dives into the lens, so
         the section leaves as one move instead of scrolling off flat. */
      if (document.querySelector('.hero-copy')) {
        gsap.to('.hero-copy', {
          yPercent: -16,
          opacity: 0.12,
          ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 },
        });
        gsap.to('.hero-meta', {
          yPercent: -45,
          opacity: 0,
          ease: 'none',
          scrollTrigger: { trigger: '.hero', start: 'top top', end: '60% top', scrub: 0.6 },
        });
      }

      /* ---------------- Standard reveals ---------------- */
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.from(el, {
          opacity: 0,
          y: 34,
          duration: 0.9,
          ease: 'swift',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>('[data-reveal-stagger]').forEach((el) => {
        const items = Array.from(el.children) as HTMLElement[];
        if (!items.length) return;
        gsap.from(items, {
          opacity: 0,
          y: 44,
          scale: 0.97,
          duration: 0.85,
          stagger: 0.075,
          ease: 'swift',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        });
      });

      /* ---------------- Directional arrivals ----------------
         Elements travel in from an edge and settle at their place, so a
         section assembles itself rather than appearing all at once. */
      gsap.utils.toArray<HTMLElement>('[data-from]').forEach((el) => {
        const dir = el.dataset.from || 'bottom';
        const dist = parseFloat(el.dataset.fromDistance || '120');
        const vec =
          dir === 'left'
            ? { x: -dist }
            : dir === 'right'
              ? { x: dist }
              : dir === 'top'
                ? { y: -dist }
                : { y: dist };

        gsap.from(el, {
          ...vec,
          opacity: 0,
          rotate: dir === 'left' ? -3 : dir === 'right' ? 3 : 0,
          duration: 1.15,
          ease: 'swift',
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      });

      /* ---------------- Word-by-word fill ----------------
         The paragraph is dim on arrival and each word lights as it
         crosses the middle of the screen, scrubbed to the wheel. */
      gsap.utils.toArray<HTMLElement>('[data-highlight]').forEach((el) => {
        const split = new SplitText(el, { type: 'words' });
        splits.push(split);
        // Dim, not invisible: if a trigger position ever went stale the
        // copy still has to be readable where it sits.
        gsap.set(split.words, { opacity: 0.25 });
        gsap.to(split.words, {
          opacity: 1,
          ease: 'none',
          stagger: 0.4,
          scrollTrigger: {
            trigger: el,
            start: 'top 78%',
            end: 'bottom 52%',
            scrub: 0.7,
          },
        });
      });

      /* ---------------- Parallax ---------------- */
      gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((el) => {
        gsap.to(el, {
          yPercent: parseFloat(el.dataset.parallax || '-10'),
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 },
        });
      });

      /* ---------------- Clip-path media reveals ---------------- */
      gsap.utils.toArray<HTMLElement>('[data-clip]').forEach((el) => {
        gsap.fromTo(
          el,
          { clipPath: 'inset(0% 0% 100% 0%)' },
          {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: 1.2,
            ease: 'mask',
            scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          }
        );
      });

      /* ---------------- Scroll-velocity marquee ----------------
         Direction follows scroll direction and the strip stretches with
         velocity, so the page feels physically connected to the wheel. */
      gsap.utils.toArray<HTMLElement>('[data-marquee]').forEach((el) => {
        const track = el.querySelector<HTMLElement>('.marquee-track');
        if (!track) return;
        const base = parseFloat(el.dataset.marquee || '-50');
        const loop = gsap.to(el.querySelectorAll('.marquee-track'), {
          xPercent: base,
          ease: 'none',
          duration: 22,
          repeat: -1,
        });

        ScrollTrigger.create({
          onUpdate: (self) => {
            const v = gsap.utils.clamp(-3, 3, self.getVelocity() / 260);
            loop.timeScale(v === 0 ? 1 : 1 + Math.abs(v));
            gsap.to(track.parentElement, {
              skewX: gsap.utils.clamp(-7, 7, -v * 1.8),
              duration: 0.5,
              ease: 'power2.out',
            });
          },
        });
      });

      /* ---------------- Count up ---------------- */
      gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
        const target = parseFloat(el.dataset.count || '0');
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 2,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 92%', once: true },
          onUpdate: () => {
            el.textContent = String(Math.round(obj.v));
          },
        });
      });

      /* ---------------- SVG line draw ---------------- */
      gsap.utils.toArray<HTMLElement>('[data-draw]').forEach((el) => {
        gsap.fromTo(
          el,
          { scaleX: 0 },
          {
            scaleX: 1,
            transformOrigin: 'left center',
            duration: 1.1,
            ease: 'swift',
            scrollTrigger: { trigger: el, start: 'top 92%', once: true },
          }
        );
      });

      /* ---------------- Pinned horizontal track ----------------
         Desktop only: pinning fights native scroll on touch, and the
         track falls back to an ordinary wrapping grid on small screens. */
      const mm = gsap.matchMedia();
      mm.add('(min-width: 1024px)', () => {
        gsap.utils.toArray<HTMLElement>('[data-hscroll]').forEach((section) => {
          const track = section.querySelector<HTMLElement>('.htrack');
          if (!track) return;

          const distance = () => track.scrollWidth - window.innerWidth + 160;

          const tween = gsap.to(track, {
            x: () => -distance(),
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: () => '+=' + distance(),
              pin: true,
              scrub: 1,
              invalidateOnRefresh: true,
              anticipatePin: 1,
            },
          });

          // Cards lift as they cross the middle of the screen.
          gsap.utils.toArray<HTMLElement>('.hcard', track).forEach((card) => {
            gsap.from(card, {
              y: 60,
              opacity: 0,
              duration: 0.6,
              ease: 'swift',
              scrollTrigger: {
                trigger: card,
                containerAnimation: tween,
                start: 'left 92%',
                once: true,
              },
            });
          });
        });
      });

      /* ---------------- Stacking cards ---------------- */
      gsap.utils.toArray<HTMLElement>('[data-stack]').forEach((wrap) => {
        const cards = gsap.utils.toArray<HTMLElement>('.stack-card', wrap);
        cards.forEach((card, i) => {
          if (i === cards.length - 1) return;
          gsap.to(card, {
            scale: 0.9,
            opacity: 0.35,
            ease: 'none',
            scrollTrigger: {
              trigger: cards[i + 1],
              start: 'top 80%',
              end: 'top 30%',
              scrub: true,
            },
          });
        });
      });

      /* ---------------- Magnetic controls ---------------- */
      if (window.matchMedia('(pointer: fine)').matches) {
        gsap.utils.toArray<HTMLElement>('[data-magnetic]').forEach((el) => {
          const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
          const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });

          const move = (e: MouseEvent) => {
            const r = el.getBoundingClientRect();
            xTo((e.clientX - (r.left + r.width / 2)) * 0.32);
            yTo((e.clientY - (r.top + r.height / 2)) * 0.42);
          };
          const reset = () => {
            xTo(0);
            yTo(0);
          };

          el.addEventListener('mousemove', move);
          el.addEventListener('mouseleave', reset);
        });
      }
    });

    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener('load', refresh);

    return () => {
      window.removeEventListener('load', refresh);
      splits.forEach((s) => s.revert());
      ctx.revert();
    };
  }, []);

  return null;
}
