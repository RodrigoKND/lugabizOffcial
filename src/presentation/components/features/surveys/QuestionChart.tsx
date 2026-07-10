import { motion } from 'framer-motion';
import type { SurveyQuestion, SurveyResponse } from '@domain/entities';

function QuestionChart({ question, responses }: { question: SurveyQuestion; responses: SurveyResponse[] }) {
  const total = responses.length;
  const questionKey = question.id ?? question.question;
  const counts: Record<string, number> = {};
  for (const r of responses) {
    const ans = (r.answers ?? []).find(
      a => a.questionId === question.id || a.questionId === question.question || a.questionId === questionKey,
    );
    if (ans?.answer) counts[ans.answer] = (counts[ans.answer] ?? 0) + 1;
  }
  const maxCount = Math.max(1, ...Object.values(counts));

  return (
    <div className="space-y-2">
      <p className="text-[13px] font-semibold text-stone-700 leading-snug">{question.question}</p>
      {question.options.map((opt, oi) => {
        const count = counts[opt] ?? 0;
        const pct = total > 0 ? Math.round(count / total * 100) : 0;
        const barPct = Math.round(count / maxCount * 100);
        return (
          <div key={`${question.id}-opt-${oi}`}>
            <div className="flex justify-between items-center mb-0.5">
              <span className="text-[12px] text-stone-600 flex-1 truncate mr-2">{opt}</span>
              <span className="text-[11px] text-stone-400 shrink-0 font-medium">{count} · {pct}%</span>
            </div>
            <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${barPct}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
              />
            </div>
          </div>
        );
      })}
      <p className="text-[10px] text-stone-300 text-right">{total} respuestas totales</p>
    </div>
  );
}

export default QuestionChart;
