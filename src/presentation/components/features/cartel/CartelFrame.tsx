import { motion } from 'framer-motion';
import CardTitleLink from '@presentation/components/features/home/CardTitleLink';
import PhraseBurst from '@presentation/components/features/reactions/PhraseBurst';
import { useCoarsePointer } from '@presentation/hooks/useCoarsePointer';
import { useDoubleTap } from '@presentation/hooks/reactions/useDoubleTap';
import type { CardReaction } from '@presentation/hooks/verdicts/useCardReaction';
import { posterTheme, headlineSize } from './posterTheme';
import { DOUBLE_TAP_VERDICT } from './verdictOptions';
import ReactionChip from './ReactionChip';

interface CartelFrameProps {
  name: string;
  to: string;
  category?: string;
  image?: string;
  onClick: () => void;
  reaction?: CardReaction;
  topRight?: React.ReactNode;
  meta?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

// Cartel de calle. En celular, doble toque sobre la foto = "Al palo" (el toque simple abre el detalle); con mouse, un clic abre.
export default function CartelFrame({ name, to, category, image, onClick, reaction, topRight, meta, footer, className = 'w-40 sm:w-44' }: CartelFrameProps) {
  const theme = posterTheme(category);
  const gesture = useCoarsePointer() && !!reaction;
  const onPhotoTap = useDoubleTap<React.MouseEvent>(onClick, e => reaction?.react(DOUBLE_TAP_VERDICT, { x: e.clientX, y: e.clientY }));

  return (
    <motion.div role="button" tabIndex={0} onClick={onClick}
      onKeyDown={e => { if (e.key === 'Enter' && e.target === e.currentTarget) onClick(); }}
      whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 320, damping: 22 }}
      className={`${className} shrink-0 snap-start group cursor-pointer rounded-xl border-2 border-lg-text bg-lg-surface poster-shadow overflow-hidden`}>
      <div onClick={gesture ? onPhotoTap : undefined} className="aspect-[5/4] relative overflow-hidden touch-manipulation">
        <div className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
          style={{ backgroundImage: `url(${image || ''})` }} />
        <div className="absolute inset-0 poster-halftone" aria-hidden="true" />

        {category && (
          <span className={`absolute top-2 -left-1 px-2.5 py-0.5 sticker-tag text-[10px] ${theme.bg} ${theme.ink} z-10`}>{category}</span>
        )}
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1">{topRight}</div>
        {reaction && <ReactionChip reaction={reaction} />}
        <span aria-hidden="true" className="absolute bottom-1 right-2 text-[9px] font-black tracking-widest text-lg-text/80 z-10">CBBA</span>
      </div>

      <div className={`${theme.bg} ${theme.ink} px-2 py-1.5 border-y-2 border-lg-text`}>
        <p className={`font-flyer ${headlineSize(name)} line-clamp-2`}><CardTitleLink to={to}>{name}</CardTitleLink></p>
      </div>

      <div className="p-2 space-y-1.5">
        {meta}
        {footer}
      </div>
      {reaction && <PhraseBurst items={reaction.burstItems} />}
    </motion.div>
  );
}
