'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';
import DroneArt from '@/components/DroneArt';

/** Scrolling this share of the screen height flies the drone bottom edge to top edge. */
const FLIGHT_SCREENS = 0.75;
const FLIGHT_MIN_PX = 420;
/** If the scrolling stops mid-flight, the drone finishes the climb itself after this pause. */
const AUTOPILOT_DELAY_MS = 800;
/** The fastest a flight may advance (share of the climb per second). A hard flick would
 *  otherwise whip it off the top in a blink; this keeps every flight on screen for ~0.9s. */
const MAX_RATE = 1.15;
/** After a drone vanishes, the next can launch this soon. */
const COOLDOWN_MS = 150;
/** Page movement only counts as the visitor scrolling if they gave an input this recently
 *  (or are already mid-scroll). Layout shifts and navigation also move the page. */
const INPUT_WINDOW_MS = 2000;
/** Scrolling counts as one continuous gesture until it has been still for this long. */
const GESTURE_GAP_MS = 260;
/** Full side-to-side weaves over one flight. */
const SWAY_CYCLES = 1.15;

const INPUT_EVENTS = ['wheel', 'touchstart', 'touchmove', 'touchend', 'keydown', 'pointerdown', 'click'] as const;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const smooth = (t: number) => t * t * (3 - 2 * t);

/**
 * The studio drone, flying up the screen as the page is scrolled.
 *
 * Any scrolling (wheel, touch, keys, scrollbar) carries it up from the
 * bottom edge; scrolling up or down both fly it upward. When it reaches the
 * top it vanishes, and scrolling again sends the next one.
 *
 * Why it behaves the way it does:
 * - Its climb is tied to how far the page moved, not to time, so it tracks
 *   the user's hand rather than playing a canned clip.
 * - Every scroll gets a drone, however fast or slow. Whenever the page is
 *   moving and no drone is in the air, one launches. The page glides on after
 *   each wheel flick, so quick repeated flicks run together into one
 *   continuous scroll; waiting for it to go still (as an earlier version did)
 *   meant fast scrolling only ever sent a single drone.
 * - A flight ends at the top. If scrolling stops partway, the drone finishes
 *   the climb itself, otherwise it would hover over the content indefinitely.
 * - Navigation and layout shifts also move the page, so movement is only
 *   counted when it follows an actual input from the visitor.
 *
 * Decorative and inert: never takes the pointer, hidden from assistive tech,
 * and not rendered at all for visitors who ask for reduced motion.
 */
export default function ScrollDrone() {
  const root = useRef<HTMLDivElement>(null);
  const reset = useRef<() => void>(() => {});
  const [ready, setReady] = useState(false);
  const pathname = usePathname();

  // The artwork is only worth shipping to visitors who will see it fly.
  useEffect(() => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) setReady(true);
  }, []);

  // A new page starts with no drone in the air.
  useEffect(() => {
    reset.current();
  }, [pathname]);

  useEffect(() => {
    const el = root.current;
    if (!ready || !el) return;

    const flight = { progress: 0 }; // where the drone is headed: 0 = bottom edge, 1 = top edge
    let shown = 0; // where it is drawn, eased toward `progress`
    let speed = 0; // smoothed climb rate, drives the forward pitch
    let visible = false;
    let gestureActive = false; // scroll movement is still arriving
    let lastInput = 0;
    let cooldownUntil = 0;
    let lastY = window.scrollY;
    let ignoreUntil = performance.now() + 1200; // scroll restoration on load is not the visitor scrolling
    let gapTimer = 0;
    let autoTimer = 0;
    let autopilot: gsap.core.Tween | null = null;
    let W = 0;
    let H = 0;
    let bw = 0;
    let bh = 0;

    const measure = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      bw = el.offsetWidth;
      bh = el.offsetHeight;
    };
    measure();

    const tiltEl = el.querySelector<SVGGElement>('.drone-tilt');
    const gimbalEl = el.querySelector<SVGGElement>('.drone-gimbal');
    let setTilt: (v: number) => void = () => {};
    let setGimbal: (v: number) => void = () => {};
    const loops: gsap.core.Tween[] = [];

    const ctx = gsap.context(() => {
      if (tiltEl) {
        gsap.set(tiltEl, { transformOrigin: '50% 50%' });
        setTilt = gsap.quickSetter(tiltEl, 'rotation') as (v: number) => void;
      }
      if (gimbalEl) {
        // Same pivot as the About drone: the gimbal stays level while the body pitches.
        gsap.set(gimbalEl, { transformOrigin: '160px 132px' });
        setGimbal = gsap.quickSetter(gimbalEl, 'rotation') as (v: number) => void;
      }

      // Props read as spinning discs, so only the faint streaks turn.
      loops.push(
        gsap.to('.rotor-streak', { rotate: 360, duration: 0.28, ease: 'none', repeat: -1, transformOrigin: '50% 50%', paused: true }),
        // A touch of hover bob, so it is never rigid.
        gsap.to('.drone-craft', { y: -5, duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: -1, paused: true }),
        gsap.to('.led-amber', { opacity: 0.12, duration: 0.6, yoyo: true, repeat: -1, ease: 'none', paused: true }),
      );
    }, el);

    const show = () => {
      visible = true;
      measure();
      el.style.visibility = 'visible';
      loops.forEach((t) => t.play());
    };

    const hide = () => {
      visible = false;
      el.style.visibility = 'hidden';
      el.style.opacity = '0';
      loops.forEach((t) => t.pause());
    };

    const finish = () => {
      autopilot?.kill();
      autopilot = null;
      window.clearTimeout(autoTimer);
      hide();
      flight.progress = 0;
      shown = 0;
      speed = 0;
      // Scrolling that is still going on launches the next one right after this.
      cooldownUntil = performance.now() + COOLDOWN_MS;
    };

    const engageAutopilot = () => {
      if (!visible) return;
      const left = 1 - flight.progress;
      if (left <= 0) return;
      // Eases in like a lift-off, and takes longer the further there is to go.
      autopilot = gsap.to(flight, { progress: 1, duration: 0.7 + left * 1.5, ease: 'power1.in' });
    };

    const markInput = () => {
      lastInput = performance.now();
    };

    const onScroll = () => {
      const now = performance.now();
      const y = window.scrollY;
      const dy = Math.abs(y - lastY);
      lastY = y;
      if (!dy || now < ignoreUntil) return;

      // Something other than the visitor moved the page (navigation, a layout shift).
      if (!gestureActive && now - lastInput > INPUT_WINDOW_MS) return;

      gestureActive = true;
      window.clearTimeout(gapTimer);
      gapTimer = window.setTimeout(() => {
        gestureActive = false;
      }, GESTURE_GAP_MS);

      if (!visible) {
        if (now < cooldownUntil) return;
        flight.progress = 0;
        shown = 0;
        speed = 0;
        show();
      } else if (autopilot) {
        // The visitor scrolled again before it finished: hand control back.
        autopilot.kill();
        autopilot = null;
      }

      const travel = Math.max(FLIGHT_MIN_PX, window.innerHeight * FLIGHT_SCREENS);
      flight.progress = Math.min(1, flight.progress + dy / travel);

      window.clearTimeout(autoTimer);
      autoTimer = window.setTimeout(engageAutopilot, AUTOPILOT_DELAY_MS);
    };

    const tick = (_time: number, deltaMs: number) => {
      if (!visible) return;

      const dt = Math.min(deltaMs, 64) / 1000;
      const before = shown;
      const eased = shown + (flight.progress - shown) * (1 - Math.exp(-dt * 7));
      shown = Math.min(eased, shown + MAX_RATE * dt);
      const rate = (shown - before) / Math.max(dt, 0.001); // progress per second
      speed += (rate - speed) * (1 - Math.exp(-dt * 6));

      if (flight.progress >= 1 && shown > 0.996) {
        finish();
        return;
      }

      const p = shown;
      const sway = Math.min(44, W * 0.045);
      const margin = Math.max(10, W * 0.035);
      const phase = p * Math.PI * 2 * SWAY_CYCLES;

      // Right-hand lane, weaving gently. The extra `sway` of room keeps the weave on screen.
      const x = W - margin - bw - sway + Math.sin(phase) * sway;
      const y = H + (-bh - H) * p;
      const bank = Math.cos(phase) * 6; // leans into each turn
      const scale = 1 - 0.2 * p; // recedes as it climbs away

      const fadeIn = smooth(clamp(p / 0.08, 0, 1));
      const fadeOut = 1 - smooth(clamp((p - 0.85) / 0.15, 0, 1));

      el.style.opacity = String(fadeIn * fadeOut);
      el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${bank}deg) scale(${scale})`;

      // Pitches nose-down to travel, with the gimbal counter-rotating to stay level.
      const lean = clamp(speed / 1.1, 0, 1);
      setTilt(-8 * lean);
      setGimbal(8 * lean);
    };

    reset.current = () => {
      autopilot?.kill();
      autopilot = null;
      window.clearTimeout(autoTimer);
      window.clearTimeout(gapTimer);
      hide();
      flight.progress = 0;
      shown = 0;
      speed = 0;
      gestureActive = false;
      lastInput = 0;
      cooldownUntil = 0;
      lastY = window.scrollY;
      ignoreUntil = performance.now() + 700;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', measure);
    INPUT_EVENTS.forEach((e) => window.addEventListener(e, markInput, { passive: true, capture: true }));
    gsap.ticker.add(tick);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', measure);
      INPUT_EVENTS.forEach((e) => window.removeEventListener(e, markInput, { capture: true }));
      gsap.ticker.remove(tick);
      window.clearTimeout(gapTimer);
      window.clearTimeout(autoTimer);
      autopilot?.kill();
      ctx.revert();
      reset.current = () => {};
    };
  }, [ready]);

  return (
    <div className="scroll-drone" ref={root} aria-hidden="true">
      {ready && <DroneArt idPrefix="fly" shadow={false} />}
    </div>
  );
}
