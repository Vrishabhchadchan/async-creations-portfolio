import type { Metadata, Viewport } from 'next';
import { Fraunces, Archivo, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import './site.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SmoothScroll from '@/components/SmoothScroll';
import MotionEngine from '@/components/MotionEngine';
import JsonLd from '@/components/JsonLd';
import { organizationSchema, websiteSchema } from '@/lib/seo';
import { SITE_URL, site } from '@/lib/site';

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  axes: ['SOFT', 'WONK', 'opsz'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
});

const archivo = Archivo({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-archivo',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500'],
  variable: '--font-jetbrains',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#16120e',
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${site.name} — ${site.role} in ${site.city} | ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    'creative content studio Pune',
    'photography and videography Pune',
    'branding studio Maharashtra',
    'reel creation services',
    'drone shoot Pune',
    'real estate photography Pune',
    'social media management agency',
    'influencer marketing Pune',
    'product and food photography',
    'motion graphics and video editing India',
  ],
  authors: [{ name: site.name, url: SITE_URL }],
  creator: site.name,
  publisher: site.name,
  alternates: { canonical: SITE_URL },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  icons: {
    icon: [
      { url: '/images/icon/favicon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/images/icon/favicon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/images/icon/favicon-192.png',
  },
  category: 'Photography, Videography, Branding',
  formatDetection: { telephone: true, address: true, email: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${fraunces.variable} ${archivo.variable} ${mono.variable}`}>
      <body>
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <SmoothScroll />
        <MotionEngine />
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
