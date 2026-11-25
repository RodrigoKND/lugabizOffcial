import { useMemo } from 'react';
import type { User } from '@domain/entities';
import { journeyStages, currentStage, type JourneyStage } from '@presentation/components/features/users/journey/journeyStages';

// Paradas del dueño a partir de lo que el Perfil ya tiene (sin peticiones nuevas).
export function useJourney(user: User, placesCount: number, docsApproved: boolean) {
  const identityVerified = !!user.identityVerified;
  const stages = useMemo<JourneyStage[]>(
    () => journeyStages({ identityVerified, placesCount, docsApproved }),
    [identityVerified, placesCount, docsApproved],
  );
  const current = currentStage(stages);
  return { stages, current, doneCount: stages.filter(s => s.status === 'done').length, isComplete: !current };
}
