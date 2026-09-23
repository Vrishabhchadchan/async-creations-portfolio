/**
 * Single source of truth for business data, navigation, services and SEO copy.
 * Page metadata, JSON-LD structured data and the sitemap all derive from here,
 * so NAP details stay identical everywhere — which is what local search ranking
 * actually rewards.
 */

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || 'https://asynccreation.in';

export const site = {
  name: 'Async Creation',
  legalName: 'Async Creation',
  tagline: 'We Create. You Grow.',
  role: 'Creative Content & Branding Studio',
  description:
    'Async Creation is a creative content and branding studio in Pune offering photography, videography, reel creation, drone shoots, real estate shoots, social media management and brand identity design.',
  founded: '2022',
  city: 'Pune',
  state: 'Maharashtra',
  country: 'IN',
  postalCode: '411038',
  areaServed: ['Pune', 'Mumbai', 'Pimpri-Chinchwad', 'Nashik', 'Kolhapur', 'Maharashtra', 'India'],
  geo: { lat: 18.5204, lng: 73.8567 },
  email: 'asynccreations@gmail.com',
  phone: '+919960899135',
  phoneDisplay: '+91 99608 99135',
  altPhone: '+918055538888',
  altPhoneDisplay: '+91 80555 38888',
  whatsapp:
    'https://wa.me/919960899135?text=Hello!%20I%20am%20here%20to%20discuss%20a%20new%20project%20with%20Async%20Creation.',
  mailto:
    'https://mail.google.com/mail/?view=cm&fs=1&to=asynccreations@gmail.com&su=New%20Project%20Inquiry',
  socials: [
    { label: 'Instagram', href: 'https://www.instagram.com/asynccreation' },
    { label: 'YouTube', href: 'https://www.youtube.com/@asynccreation' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/company/asynccreation' },
  ],
  openingHours: 'Mo-Sa 09:00-20:00',
  priceRange: '₹₹',
} as const;

export const nav = [
  { label: 'Work', href: '/portfolio' },
  { label: 'Services', href: '/services' },
  { label: 'Real Estate', href: '/real-estate' },
  { label: 'Social & Influencer', href: '/social-media' },
  { label: 'Packages', href: '/packages' },
  { label: 'Testimonials', href: '/testimonials' },
  { label: 'About', href: '/about' },
] as const;

export type Service = {
  slug: string;
  title: string;
  short: string;
  description: string;
  deliverables: string[];
  keywords: string[];
};

export const services: Service[] = [
  {
    slug: 'photography-videography',
    title: 'Photography & Videography',
    short: 'Cinematic stills and films that give a brand a face worth remembering.',
    description:
      'Full-service photography and videography for brands, events and businesses across Pune and Maharashtra. From single-camera brand films to multi-camera event coverage, we handle direction, lighting, sound and post so you receive footage that is ready to publish.',
    deliverables: [
      'Brand films and corporate videos',
      'Event and conference coverage',
      'Portrait and team photography',
      'Multi-camera shoots with sync sound',
      'Colour-graded, delivery-ready masters',
    ],
    keywords: [
      'photography studio Pune',
      'videography services Pune',
      'corporate video production Pune',
      'brand film makers Maharashtra',
      'professional photographers Pune',
    ],
  },
  {
    slug: 'reel-creation-editing',
    title: 'Reel Creation & Editing',
    short: 'Short-form video built for the way people actually scroll.',
    description:
      'Vertical-first reel production for Instagram, YouTube Shorts and Facebook. We script hooks, shoot on location and cut fast-paced edits with trending audio, captions and motion titles — engineered so the first two seconds stop the scroll.',
    deliverables: [
      'Hook-led scripting and shot lists',
      'On-location vertical shooting',
      'Beat-matched editing with captions',
      'Trending audio and sound design',
      'Batch delivery for a full content month',
    ],
    keywords: [
      'reel creation services Pune',
      'Instagram reel editing India',
      'short form video agency',
      'vertical video production Pune',
    ],
  },
  {
    slug: 'drone-shoots',
    title: 'Drone Shoots',
    short: 'Aerial cinematography that makes a property or venue feel vast.',
    description:
      'Licensed aerial photography and drone videography for real estate, weddings, resorts, construction progress and large events. Reveal shots, orbits and top-downs captured in 4K and colour graded to match the rest of your film.',
    deliverables: [
      '4K aerial video and stills',
      'Property and site reveal shots',
      'Construction progress documentation',
      'Event and venue aerials',
      'Permission-compliant flight planning',
    ],
    keywords: [
      'drone photography Pune',
      'aerial videography Maharashtra',
      'drone shoot for real estate',
      '4K drone video services India',
    ],
  },
  {
    slug: 'real-estate',
    title: 'Real Estate Photography, Videography & Branding',
    short: 'Listings that sell faster because they finally look like the real thing.',
    description:
      'A complete visual package for builders, developers, architects and agents — interior and exterior photography, walkthrough films, drone aerials, floor-plan visuals and the brochure and social creatives that carry them to market.',
    deliverables: [
      'Interior and exterior photography',
      'Cinematic property walkthrough films',
      'Drone aerials and site context shots',
      'Brochure, hoarding and listing creatives',
      'Project launch campaign assets',
    ],
    keywords: [
      'real estate photography Pune',
      'property videography services',
      'builder marketing agency Pune',
      'real estate branding India',
      'property walkthrough video',
    ],
  },
  {
    slug: 'social-media-management',
    title: 'Social Media Management & Campaigns',
    short: 'A content engine that runs every month, not just at launch.',
    description:
      'End-to-end social media management for brands that want consistency — monthly content calendars, shoot days, design, copywriting, scheduling, community replies and paid campaign support, reported against metrics that matter.',
    deliverables: [
      'Monthly content calendar and strategy',
      'Shoot days and asset production',
      'Copywriting, design and scheduling',
      'Community management and replies',
      'Paid campaign setup and reporting',
    ],
    keywords: [
      'social media management Pune',
      'social media agency Maharashtra',
      'Instagram marketing services India',
      'digital campaign management Pune',
    ],
  },
  {
    slug: 'influencer-creator-management',
    title: 'Influencer & Creator Management',
    short: 'The right creators, briefed properly, measured honestly.',
    description:
      'Creator-led campaigns from shortlist to settlement. We match creators to your audience rather than their follower count, handle briefs, contracts, content approvals and usage rights, and report on reach, saves and actual conversions.',
    deliverables: [
      'Creator shortlisting and vetting',
      'Campaign briefs and contracts',
      'Content approvals and usage rights',
      'Barter and paid collaboration handling',
      'Performance reporting per creator',
    ],
    keywords: [
      'influencer marketing agency Pune',
      'creator management India',
      'influencer campaign management',
      'brand collaboration agency Maharashtra',
    ],
  },
  {
    slug: 'product-food-shoots',
    title: 'Product & Food Shoots',
    short: 'Controlled light, styled frames, catalogue-ready output.',
    description:
      'Studio and on-location product and food photography for e-commerce, menus, packaging and ad campaigns. Consistent lighting, accurate colour and clean retouching so a full catalogue looks like it was shot in one sitting — because it was.',
    deliverables: [
      'E-commerce catalogue photography',
      'Food and beverage styling shoots',
      'Packaging and hero product frames',
      'Stop-motion and product reels',
      'Retouching and colour consistency',
    ],
    keywords: [
      'product photography Pune',
      'food photography services India',
      'ecommerce catalogue shoot Pune',
      'menu photography Maharashtra',
    ],
  },
  {
    slug: 'brand-identity-design',
    title: 'Brand Identity & Creative Design',
    short: 'The logic underneath the logo, not just the logo.',
    description:
      'Brand identity systems built to survive contact with the real world — logo, type, colour, layout rules and templates, documented in a guideline your team and every future vendor can actually follow.',
    deliverables: [
      'Logo design and lockups',
      'Typography and colour systems',
      'Brand guideline documentation',
      'Packaging and collateral design',
      'Social and presentation templates',
    ],
    keywords: [
      'brand identity design Pune',
      'logo design agency Maharashtra',
      'creative design studio India',
      'branding agency Pune',
    ],
  },
  {
    slug: 'content-strategy',
    title: 'Content Strategy & Campaign Planning',
    short: 'Decide what to make before spending a rupee making it.',
    description:
      'Research-led content strategy: audience and competitor study, messaging pillars, channel planning, a quarterly content roadmap and campaign calendars tied to your launches, seasons and sales targets.',
    deliverables: [
      'Audience and competitor research',
      'Messaging pillars and tone of voice',
      'Quarterly content roadmap',
      'Campaign calendars and launch plans',
      'Performance review and iteration',
    ],
    keywords: [
      'content strategy agency Pune',
      'campaign planning services India',
      'marketing strategy consultant Pune',
    ],
  },
  {
    slug: 'motion-graphics-editing',
    title: 'Motion Graphics & Video Editing',
    short: 'Post-production that carries the story after the camera stops.',
    description:
      'Editing, motion graphics, 2D and 3D animation, logo stings, explainer videos, subtitles and colour grading — for footage we shot or footage you already have sitting on a drive.',
    deliverables: [
      'Long-form and short-form editing',
      'Motion graphics and animated titles',
      'Logo stings and brand animations',
      'Explainer and product animations',
      'Colour grading and subtitles',
    ],
    keywords: [
      'video editing services Pune',
      'motion graphics studio India',
      'animation agency Maharashtra',
      'explainer video production Pune',
    ],
  },
];

export const whyAsync = [
  {
    title: 'One studio, the whole pipeline',
    body: 'Strategy, shoot, edit, design and distribution live under one roof. No hand-offs between three vendors, no one blaming the other when a deadline slips.',
  },
  {
    title: 'Built for the platform, not the showreel',
    body: 'Every frame is cut for where it will actually be seen — a vertical reel, a hoarding, a listing page or a pitch deck. Format is a decision we make before the shoot, not after.',
  },
  {
    title: 'Founder-led on every project',
    body: 'The people you meet in the first call are the people directing on set. Small team, direct line, no account-manager telephone game.',
  },
  {
    title: 'Fast, predictable delivery',
    body: 'Agreed timelines with previews at each stage. Reels within days, full campaigns on a published calendar you can plan your launch around.',
  },
  {
    title: 'Numbers, not vibes',
    body: 'Campaigns are reported against reach, saves, enquiries and cost per result — so you know which content earned its budget and which did not.',
  },
  {
    title: 'Specialists in real estate',
    body: 'A dedicated vertical for builders and agents: interiors, aerials, walkthroughs and launch campaigns, with an eye for what makes a property enquiry actually convert.',
  },
];

export const processSteps = [
  { step: '01', title: 'Discovery', body: 'We learn the business, the audience and the goal behind the shoot before anyone picks up a camera.' },
  { step: '02', title: 'Strategy & Plan', body: 'Concepts, references, shot lists, locations and a calendar — approved by you before production begins.' },
  { step: '03', title: 'Production', body: 'Shoot days run to plan, with lighting, sound and direction handled by the team on set.' },
  { step: '04', title: 'Post & Design', body: 'Edit, grade, motion graphics and design, delivered for review in rounds you can actually give notes on.' },
  { step: '05', title: 'Launch & Grow', body: 'Publishing, campaign support and reporting — then we use what the numbers say to shape the next cycle.' },
];

export const packages = [
  {
    name: 'Starter',
    tagline: 'For new brands finding their footing',
    price: 'From ₹25,000',
    period: 'per month',
    features: [
      '1 shoot day per month',
      '8 social posts + 4 reels',
      'Basic content calendar',
      'Caption writing and hashtags',
      'Monthly performance snapshot',
    ],
    cta: 'Start here',
    featured: false,
  },
  {
    name: 'Growth',
    tagline: 'For brands publishing every week',
    price: 'From ₹55,000',
    period: 'per month',
    features: [
      '2 shoot days per month',
      '16 posts + 10 reels',
      'Full strategy and content calendar',
      'Motion graphics and design assets',
      'Community management',
      'Paid campaign setup and reporting',
    ],
    cta: 'Most popular',
    featured: true,
  },
  {
    name: 'Signature',
    tagline: 'For launches, developers and campaigns',
    price: 'Custom',
    period: 'per project',
    features: [
      'Unlimited shoot days in scope',
      'Drone, real estate and product coverage',
      'Brand identity and creative design',
      'Influencer and creator campaigns',
      'Dedicated strategist and editor',
      'Full campaign reporting',
    ],
    cta: 'Request a quote',
    featured: false,
  },
];

export const testimonials = [
  {
    quote:
      'They understood the project before we finished explaining it. The walkthrough film and aerials did more for our launch than the hoardings did — we closed site visits off the reel alone.',
    name: 'Rohit Deshpande',
    role: 'Director, Residential Developer, Pune',
  },
  {
    quote:
      'Our feed finally looks like one brand instead of ten different people posting. The monthly calendar means we always know what is going out and why.',
    name: 'Sneha Kulkarni',
    role: 'Founder, D2C Skincare Label',
  },
  {
    quote:
      'The food shoot changed how our menu performs. Same dishes, same restaurant — the photographs just stopped underselling them.',
    name: 'Imran Shaikh',
    role: 'Owner, Restaurant Group',
  },
  {
    quote:
      'Async ran our entire creator campaign end to end. They picked smaller creators we would have skipped, and those posts outperformed the big names.',
    name: 'Priya Nair',
    role: 'Marketing Lead, Lifestyle Brand',
  },
];

export const faqs = [
  {
    q: 'What services does Async Creation offer?',
    a: 'Async Creation is a creative content and branding studio offering photography, videography, reel creation and editing, drone shoots, real estate photography and branding, social media management, influencer and creator management, product and food shoots, brand identity design, content strategy and motion graphics.',
  },
  {
    q: 'Where is Async Creation based and which areas do you serve?',
    a: 'We are based in Pune, Maharashtra, and regularly shoot across Pune, Pimpri-Chinchwad, Mumbai, Nashik and Kolhapur. We travel anywhere in India for full-scale projects and campaigns.',
  },
  {
    q: 'How much does a photography or videography shoot cost?',
    a: 'Shoot pricing depends on days, crew, locations and deliverables. Monthly content retainers start from ₹25,000 and full project packages are quoted after a discovery call. Share your brief and we will send a written quote.',
  },
  {
    q: 'Do you offer drone shoots for real estate projects?',
    a: 'Yes. Aerial photography and 4K drone videography are a core part of our real estate package, covering site reveals, orbits, top-down layouts and construction progress, with permission-compliant flight planning.',
  },
  {
    q: 'How quickly are photos and videos delivered?',
    a: 'Reels and short-form edits are typically delivered within three to five working days. Full photo sets take about a week, and long-form brand films or campaign packages run on a timeline agreed before the shoot.',
  },
  {
    q: 'Can you manage our social media accounts every month?',
    a: 'Yes. Our social media management retainers cover strategy, monthly shoot days, design, copywriting, scheduling, community management and paid campaign support, with reporting at the end of every cycle.',
  },
];

export const team = [
  {
    name: 'Abhijeet Vorudkar',
    role: 'Founder & Director',
    photo: '/images/team/abhijeet-vorudkar.jpg',
    bio: 'Leads the creative team across content creation, cinematography, digital media and brand communication. With 4+ years in the industry, he oversees the complete creative process — concept, production, editing, content strategy and client communication.',
    skills: ['Cinematography', 'Drone Cinematography', 'Content Strategy', 'Social Media Growth', 'Photography', 'Post-Production'],
    meta: [
      { k: '4+', v: 'Years experience' },
      { k: '7+', v: 'Brands & orgs' },
      { k: '2', v: 'Awards won' },
    ],
    note: 'Young Trailblazer Award 2024 · Persona Organizer Award 2026 · B.Tech in Artificial Intelligence & Data Science, MIT ADT University',
    phone: '+919960899135',
  },
  {
    name: 'Ritesh Hatture',
    role: 'Co-Founder & Creative Director',
    photo: '/images/team/ritesh-hatture.jpg',
    bio: 'Drives the brand and production side of the studio, from client strategy to on-set direction. A photographer and cinematographer based in Pune, he has covered event coverage, promotional shoots and social content end to end.',
    skills: ['Cinematography & Videography', 'Content Creation', 'Reel & Short-Form Video', 'Visual Storytelling'],
    meta: [
      { k: '3+', v: 'Orgs & projects' },
      { k: 'Pune', v: 'Based in' },
      { k: 'BBA', v: 'MIT ADT University' },
    ],
    note: 'Media Assistant, MIT ADT University Impact Student Council · TEDxMIT ADT media & videography team',
    phone: '+918055538888',
  },
];

export const stats = [
  { value: 150, suffix: '+', label: 'Projects delivered' },
  { value: 60, suffix: '+', label: 'Brands served' },
  { value: 10, suffix: '', label: 'Creative services' },
  { value: 4, suffix: '+', label: 'Years in production' },
];
