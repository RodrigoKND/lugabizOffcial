interface CardTitleLinkProps {
  to: string;
  className?: string;
  children: React.ReactNode;
}

// Enlace real (<a href>) en el título de una tarjeta: Google solo sigue enlaces, no onClick.
// El clic normal lo resuelve la tarjeta (navegación SPA); Ctrl/Cmd/medio abren pestaña nueva como un enlace cualquiera.
const CardTitleLink: React.FC<CardTitleLinkProps> = ({ to, className, children }) => (
  <a
    href={to}
    className={className}
    onClick={(e) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) { e.stopPropagation(); return; }
      e.preventDefault();
    }}
  >
    {children}
  </a>
);

export default CardTitleLink;
