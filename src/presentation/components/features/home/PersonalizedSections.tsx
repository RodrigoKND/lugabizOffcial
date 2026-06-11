import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { HomeSection } from '@presentation/hooks/home/usePersonalizedSections';
import ScrollRow from '@presentation/components/features/home/ScrollRow';
import CompactCard from '@presentation/components/features/home/CompactCard';
import EventCardSmall from '@presentation/components/features/home/EventCardSmall';

interface PersonalizedSectionsProps {
  sections: HomeSection[];
  loading: boolean;
}

const PersonalizedSections: React.FC<PersonalizedSectionsProps> = ({ sections, loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-8">
        {[1, 2].map(i => (
          <div key={i}>
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className="w-4 h-4 rounded bg-stone-200 animate-pulse" />
              <div className="h-4 w-44 bg-stone-200 rounded animate-pulse" />
            </div>
            <div className="flex gap-3 overflow-hidden">
              {[1, 2, 3, 4].map(j => (
                <div key={j} className="w-36 shrink-0 rounded-xl bg-stone-100 animate-pulse" style={{ height: 148 }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (sections.length === 0) return null;

  return (
    <div className="space-y-1">
      {sections.map(section => {
        const isEvent = section.type === 'events';
        const isMixed = section.type === 'mixed';

        return (
          <ScrollRow
            key={section.id}
            title={section.title}
            subtitle={section.subtitle}
            icon={<Sparkles className="w-4 h-4 text-primary-400" />}
          >
            {isEvent
              ? section.events.map(event => (
                  <EventCardSmall
                    key={event.id}
                    event={event}
                    onClick={() => navigate(`/event/${event.id}`)}
                  />
                ))
              : isMixed
                ? [
                    ...section.places.map(place => (
                      <CompactCard
                        key={`p-${place.id}`}
                        image={place.image}
                        name={place.name}
                        rating={place.rating}
                        category={place.category?.name}
                        to={`/place/${place.id}`}
                      />
                    )),
                    ...section.events.map(event => (
                      <EventCardSmall
                        key={`e-${event.id}`}
                        event={event}
                        onClick={() => navigate(`/event/${event.id}`)}
                      />
                    )),
                  ]
                : section.places.map(place => (
                    <CompactCard
                      key={place.id}
                      image={place.image}
                      name={place.name}
                      rating={place.rating}
                      category={place.category?.name}
                      to={`/place/${place.id}`}
                    />
                  ))}
          </ScrollRow>
        );
      })}
    </div>
  );
};

export default PersonalizedSections;
