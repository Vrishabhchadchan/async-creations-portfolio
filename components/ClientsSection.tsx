import Image from 'next/image';
import SectionHead from './SectionHead';
import CardCorners from './CardCorners';
import { type ClientItem, isVisible } from '@/lib/clients';

export default function ClientsSection({ items }: { items: ClientItem[] }) {
  const visibleClients = items.filter(isVisible);
  if (!visibleClients.length) return null;

  return (
    <section className="section clients-section" id="clients">
      <div className="shell">
        <SectionHead
          label="Our Clients"
          title={
            <>
              Trusted by leading <span className="italic-serif">institutions &amp; brands</span>
            </>
          }
          lede="From universities and educational institutions to fast-growing consumer brands across Pune and Maharashtra."
        />

        <div className="clients-grid" data-reveal-stagger>
          {visibleClients.map((client) => {
            const cardContent = (
              <>
                <CardCorners />
                <div className="client-logo-box">
                  <Image
                    src={client.logoUrl}
                    alt={`${client.name} logo`}
                    width={220}
                    height={110}
                    className="client-logo-img"
                    quality={90}
                  />
                </div>
                <h4 className="client-card-title">{client.name}</h4>
              </>
            );

            return client.website ? (
              <a
                key={client.id}
                href={client.website}
                target="_blank"
                rel="noopener noreferrer"
                className="client-card has-link"
              >
                {cardContent}
              </a>
            ) : (
              <div key={client.id} className="client-card">
                {cardContent}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
