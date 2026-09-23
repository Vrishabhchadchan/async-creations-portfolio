'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
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
 *   data-cards                      grid: 3D entrance, per-column drift
 *                                   and pointer tilt on its children
 *   data-from="left|right|top"      arrive from an edge
 *   data-highlight                  light a passage word by word
 *   data-kenburns                   slow scale push on contained media
 *   data-hscroll                    pin and travel a .htrack sideways
 *   data-stack                      scale back .stack-card as the next
 *                                   one covers it
 */
export default function MotionEngine() {
  // This lives in the root layout, so without a route key it would set up
  // once and never again — every page after the first would arrive with
  // no animation at all.
  const pathname = usePathname();

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);

    CustomEase.create('swift', '0.16, 1, 0.3, 1');
    CustomEase.create('mask', '0.65, 0, 0.35, 1');

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const splits: SplitText[] = [];

    // Hands CSS fallbacks (like the marquee keyframes) over to GSAP.
    document.documentElement.classList.add('js-motion');

    let ctx: gsap.Context | undefined;
    let cancelled = false;

    // Splitting every heading and building the scroll triggers for a page
    // is heavy. Holding it until after the next paint lets a navigation
    // render immediately and the choreography attach a frame later.
    const setup = () => {
      if (cancelled) return;
      ctx = gsap.context(() => {
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

      /* ---------------- Slow push on media ----------------
         The image drifts in scale across its whole pass, so a gallery
         keeps moving instead of freezing once it has revealed. */
      gsap.utils.toArray<HTMLElement>('[data-kenburns] img').forEach((img) => {
        gsap.fromTo(
          img,
          { scale: 1.16 },
          {
            scale: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: img.parentElement as HTMLElement,
              start: 'top bottom',
              end: 'bottom top',
              scrub: 1.2,
            },
          }
        );
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

      /* ---------------- Card grids ----------------
         A one-shot fade leaves a grid frozen for the rest of the page.
         Each grid gets three layers instead: a staggered 3D entrance,
         a permanent per-column drift so it keeps breathing while it is
         on screen, and pointer tilt on desktop. */
      gsap.utils.toArray<HTMLElement>('[data-cards]').forEach((grid) => {
        const cards = Array.from(grid.children) as HTMLElement[];
        if (!cards.length) return;

        gsap.from(cards, {
          y: 64,
          rotateX: -11,
          scale: 0.96,
          opacity: 0,
          duration: 0.9,
          stagger: 0.08,
          ease: 'swift',
          scrollTrigger: { trigger: grid, start: 'top 86%', once: true },
        });

        // Second beat: once a card has landed, its viewfinder brackets
        // snap on and a glint crosses it. Sequencing it after the tip-in
        // keeps the two moves from competing. clearProps hands the
        // transform back to CSS so the hover pull-out still works.
        cards.forEach((card, i) => {
          const at = 0.5 + i * 0.085;
          const corners = card.querySelectorAll('.card-corner');
          if (corners.length) {
            gsap.from(corners, {
              scale: 0,
              opacity: 0,
              duration: 0.55,
              delay: at,
              stagger: 0.06,
              ease: 'back.out(2.6)',
              clearProps: 'transform,opacity',
              scrollTrigger: { trigger: grid, start: 'top 86%', once: true },
            });
          }
          if (card.classList.contains('svc')) {
            gsap.fromTo(
              card,
              { '--shine': '220%' },
              {
                '--shine': '-120%',
                duration: 1.4,
                delay: at + 0.15,
                ease: 'power2.inOut',
                scrollTrigger: { trigger: grid, start: 'top 86%', once: true },
              }
            );
          }
        });

        // No per-column drift here. Offsetting the columns broke the
        // grid's alignment and read as a layout bug rather than motion;
        // the rows stay locked and the life comes from the entrance,
        // the brackets and the hover instead.

        if (window.matchMedia('(pointer: fine)').matches) {
          cards.forEach((card) => {
            const rx = gsap.quickTo(card, 'rotateX', { duration: 0.5, ease: 'power3.out' });
            const ry = gsap.quickTo(card, 'rotateY', { duration: 0.5, ease: 'power3.out' });

            card.addEventListener('mousemove', (e) => {
              const r = card.getBoundingClientRect();
              rx((((e as MouseEvent).clientY - r.top) / r.height - 0.5) * -8);
              ry((((e as MouseEvent).clientX - r.left) / r.width - 0.5) * 8);
            });
            card.addEventListener('mouseleave', () => {
              rx(0);
              ry(0);
            });
          });
        }
      });

      /* ---------------- Card spotlight ----------------
         Feeds the pointer position to CSS, which paints a warm radial
         highlight under the cursor. Separate from the grid handler so it
         also covers cards that arrive via data-from or the pinned track. */
      if (window.matchMedia('(pointer: fine)').matches) {
        gsap.utils.toArray<HTMLElement>('.svc').forEach((card) => {
          card.addEventListener('mousemove', (e) => {
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mx', `${(e as MouseEvent).clientX - r.left}px`);
            card.style.setProperty('--my', `${(e as MouseEvent).clientY - r.top}px`);
          });
        });
      }

      /* ---------------- Accordion ----------------
         Native <details> snaps open. Driving it with GSAP keeps the FAQ
         consistent with the rest of the page; the open state still lives
         on the element, so semantics and keyboard support are unchanged. */
      gsap.utils.toArray<HTMLDetailsElement>('.faq details').forEach((d) => {
        const summary = d.querySelector('summary');
        const panel = d.querySelector('p');
        if (!summary || !panel) return;

        summary.addEventListener('click', (e) => {
          e.preventDefault();
          if (d.open) {
            gsap.to(panel, {
              height: 0,
              opacity: 0,
              duration: 0.32,
              ease: 'power2.inOut',
              onComplete: () => {
                d.open = false;
                gsap.set(panel, { height: 'auto' });
              },
            });
          } else {
            d.open = true;
            gsap.fromTo(
              panel,
              { height: 0, opacity: 0 },
              { height: 'auto', opacity: 1, duration: 0.42, ease: 'swift' }
            );
          }
        });
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

    };

    const raf = requestAnimationFrame(() => requestAnimationFrame(setup));

    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener('load', refresh);
    // 'load' never fires again on a client-side navigation.
    const settle = window.setTimeout(refresh, 320);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('load', refresh);
      window.clearTimeout(settle);
      splits.forEach((s) => s.revert());
      ctx?.revert();
    };
  }, [pathname]);

  return null;
}
