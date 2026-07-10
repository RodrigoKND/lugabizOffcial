function MentionText({ text }: { text: string }) {
  const parts = text.split(/(@\w+)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('@')
          ? <span key={i} className="font-bold text-amber-400">{p}</span>
          : <span key={i}>{p}</span>,
      )}
    </>
  );
}

export default MentionText;
