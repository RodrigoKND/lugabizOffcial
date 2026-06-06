import { EmptyHomeStateProps } from '@domain/entities/HomeTypes';

const EmptyHomeState: React.FC<EmptyHomeStateProps> = ({ onPublish }) => (
  <div className="absolute inset-0 flex items-center justify-center py-42">
    <div className="text-center flex flex-col items-center justify-center max-w-md w-full">
      <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center mx-auto mb-4">
        <span className="text-primary-500 text-3xl">🦕</span>
      </div>
      <h3 className="text-lg font-bold text-text-primary mb-2">Aún no hay contenido</h3>
      <p className="text-sm text-text-secondary mb-6 max-w-xs mx-auto">
        No hay lugares ni eventos disponibles. ¡Sé el primero en compartir!
      </p>
      <button onClick={onPublish}
        className="px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold text-sm hover:bg-primary-600 transition-all shadow-xs">
        Publicar Algo
      </button>
    </div>
  </div>
);

export default EmptyHomeState;
