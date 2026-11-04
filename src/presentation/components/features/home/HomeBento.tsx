import DailyPollCard from './DailyPollCard';
import PassportCard from './PassportCard';
import PlanTodayCard from './PlanTodayCard';

// Bloque fijo de las 3 funciones sociales: siempre visible, compacto (no suma scroll).
const HomeBento: React.FC = () => (
  <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-5 grid grid-cols-2 md:grid-cols-4 gap-2.5">
    <div className="col-span-2 md:col-span-2"><DailyPollCard /></div>
    <PassportCard />
    <PlanTodayCard />
  </div>
);

export default HomeBento;
