import { EmptyHomeStateProps } from '@domain/entities/HomeTypes';

const EmptyHomeState: React.FC<EmptyHomeStateProps> = ({ onPublish }) => (
  <div className="absolute inset-0 flex items-center justify-center py-42">
    <div className="text-center flex flex-col items-center justify-center max-w-md w-full">
      <div className="w-20 h-20 rounded-2xl bg-lg-surface flex items-center justify-center mx-auto mb-4">
        <span className="text-lg-accent text-3xl">🦕</span>
      </div>
      <h3 className="font-flyer-sm text-2xl text-lg-text mb-2">Aún no hay contenido</h3>
      <p className="text-sm text-lg-dim mb-6 max-w-xs mx-auto">
        No hay lugares ni eventos disponibles. ¡Sé el primero en compartir!
      </p>
      <button onClick={onPublish}
        className="px-6 py-3 bg-lg-accent text-lg-ink rounded-full font-bold text-sm hover:brightness-110 transition">
        Publicar Algo
      </button>
    </div>
  </div>
);

export default EmptyHomeState;
