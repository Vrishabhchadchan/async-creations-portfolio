/**
 * The work sections shown as cards on the home page and as anchored
 * sections on the work page. One per service, in the same order as the
 * Services page, so a card, its section and its service always line up.
 *
 * `art.src` is an optional photograph behind the card; `art.css` is the
 * layered background used when there is no photo (and underneath one).
 * To upgrade a card, set `art.src` to a new image, or add a transparent
 * PNG as `cutout` for the sticker-style subject seen in the reference.
 */

export type WorkSection = {
  /** Matches the service slug, and is the anchor id on the work page. */
  slug: string;
  /** Oversized condensed title across the top of the card. */
  mega: string;
  /** Small title over the button. */
  name: string;
  tagline: string;
  /** Gallery categories whose uploads appear in this section. */
  categories: string[];
  art: { src?: string; position?: string; css: string };
  accent: [string, string];
  cutout?: string;
};

const dusk =
  'radial-gradient(120% 60% at 50% 100%, rgba(255,150,80,.55), transparent 62%), linear-gradient(180deg,#0b1220 0%,#1c2c4d 48%,#3c4a70 72%,#b5683c 100%)';

const stars =
  'radial-gradient(1.5px 1.5px at 18% 22%, #fff9, transparent), radial-gradient(1.5px 1.5px at 72% 14%, #fff8, transparent), radial-gradient(1px 1px at 44% 30%, #fff7, transparent), radial-gradient(1.5px 1.5px at 86% 38%, #fff7, transparent), radial-gradient(1px 1px at 28% 44%, #fff6, transparent)';

const skyline = (color: string) =>
  [
    `linear-gradient(${color},${color}) 4% 100%/9% 30% no-repeat`,
    `linear-gradient(${color},${color}) 15% 100%/8% 44% no-repeat`,
    `linear-gradient(${color},${color}) 25% 100%/11% 26% no-repeat`,
    `linear-gradient(${color},${color}) 38% 100%/9% 52% no-repeat`,
    `linear-gradient(${color},${color}) 49% 100%/12% 36% no-repeat`,
    `linear-gradient(${color},${color}) 63% 100%/8% 58% no-repeat`,
    `linear-gradient(${color},${color}) 73% 100%/11% 32% no-repeat`,
    `linear-gradient(${color},${color}) 86% 100%/10% 46% no-repeat`,
  ].join(',');

const rings = (at: string) =>
  `repeating-radial-gradient(circle at ${at}, rgba(255,255,255,.1) 0 2px, transparent 2px 28px)`;

const grid =
  'linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px) 0 0/34px 34px, linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px) 0 0/34px 34px';

export const WORK_SECTIONS: WorkSection[] = [
  {
    slug: 'photography-videography',
    mega: 'Photo & Video',
    name: 'Photography & Videography',
    tagline: 'Stills and films that give a brand a face.',
    categories: [
      'photography',
      'wedding',
      'prewedding',
      'corporate',
      'event',
      'institutional',
      'travel',
      'portrait',
      'fashion',
    ],
    art: { src: '/images/work/service-photo.jpg', position: '64% 30%', css: '#111' },
    accent: ['#ff5a1f', '#ff8a3d'],
  },
  {
    slug: 'reel-creation-editing',
    mega: 'Reel Creation',
    name: 'Reel Creation & Editing',
    tagline: 'Short-form built for the way people scroll.',
    categories: ['film'],
    art: { src: '/images/work/service-reels.jpg', position: '67% 40%', css: '#111' },
    accent: ['#ff2f7e', '#ff6a3d'],
  },
  {
    slug: 'drone-shoots',
    mega: 'Drone Shoots',
    name: 'Drone Shoots',
    tagline: 'Creative 4K aerial cinematography.',
    categories: ['drone'],
    art: { css: `${stars}, ${dusk}` },
    accent: ['#ff5a1f', '#ff8a3d'],
  },
  {
    slug: 'real-estate',
    mega: 'Real Estate',
    name: 'Real Estate',
    tagline: 'Listings that sell faster because they look real.',
    categories: ['realestate'],
    art: {
      css: `${skyline('#0a0c12')}, radial-gradient(90% 55% at 50% 100%, rgba(255,170,90,.5), transparent 65%), linear-gradient(180deg,#141b2e 0%,#3a4566 58%,#d08a55 100%)`,
    },
    accent: ['#f59e0b', '#ef6a2a'],
  },
  {
    slug: 'social-media-management',
    mega: 'Social Media',
    name: 'Social Media Management',
    tagline: 'A content engine that runs every month.',
    categories: ['social'],
    art: { css: `${rings('72% 62%')}, radial-gradient(90% 60% at 80% 20%, rgba(168,85,247,.55), transparent 60%), linear-gradient(160deg,#0b0a16,#1d1240)` },
    accent: ['#8b5cf6', '#ec4899'],
  },
  {
    slug: 'influencer-creator-management',
    mega: 'Influencer Management',
    name: 'Influencer & Creator Management',
    tagline: 'Right creators. Real reach. Real results.',
    categories: ['influencer'],
    art: { css: `${rings('26% 70%')}, radial-gradient(90% 60% at 20% 15%, rgba(236,72,153,.55), transparent 60%), linear-gradient(200deg,#160a14,#3a0f33)` },
    accent: ['#ff5a1f', '#ec4899'],
  },
  {
    slug: 'product-food-shoots',
    mega: 'Product & Food',
    name: 'Product & Food Shoots',
    tagline: 'Controlled light, catalogue-ready frames.',
    categories: ['product'],
    art: { css: `${rings('50% 58%')}, radial-gradient(80% 55% at 50% 60%, rgba(251,146,60,.5), transparent 62%), linear-gradient(180deg,#1a0f08,#3b1d0d)` },
    accent: ['#f59e0b', '#ef4444'],
  },
  {
    slug: 'brand-identity-design',
    mega: 'Brand Identity',
    name: 'Brand Identity & Design',
    tagline: 'The logic underneath the logo.',
    categories: ['brand', 'branding'],
    art: { css: 'radial-gradient(80% 60% at 78% 25%, rgba(196,148,255,.7), transparent 60%), radial-gradient(70% 55% at 20% 80%, rgba(80,120,255,.5), transparent 60%), linear-gradient(160deg,#07071a,#1a1450)' },
    accent: ['#7c5cff', '#c026d3'],
  },
  {
    slug: 'content-strategy',
    mega: 'Content Strategy',
    name: 'Content Strategy & Planning',
    tagline: 'Decide what to make before making it.',
    categories: ['strategy'],
    art: { css: `${grid}, radial-gradient(80% 60% at 30% 25%, rgba(45,212,191,.4), transparent 62%), linear-gradient(170deg,#061312,#0b2a2e)` },
    accent: ['#14b8a6', '#3b82f6'],
  },
  {
    slug: 'motion-graphics-editing',
    mega: 'Motion Graphics',
    name: 'Motion Graphics & Video Editing',
    tagline: 'Post-production that carries the story.',
    categories: ['motion'],
    art: { src: '/images/work/service-cine.jpg', position: '38% 40%', css: '#111' },
    accent: ['#ff2f7e', '#ff7a2f'],
  },
];

const CATEGORY_TO_SECTION = new Map<string, string>();
for (const s of WORK_SECTIONS) for (const c of s.categories) CATEGORY_TO_SECTION.set(c, s.slug);

/** Unknown categories fall back to the general photo/video section rather than vanishing. */
export function sectionForCategory(category: string): string {
  return CATEGORY_TO_SECTION.get(category) ?? WORK_SECTIONS[0].slug;
}
