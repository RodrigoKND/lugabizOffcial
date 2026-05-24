interface StoryCardProps {
  image?: string;
  name: string;
  onClick: () => void;
}

const StoryCard: React.FC<StoryCardProps> = ({ image, name, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-1.5 shrink-0 group">
    <div className="p-[2px] rounded-full bg-gradient-to-br from-primary-400 via-pink-400 to-orange-400 group-active:scale-90 transition-transform">
      <div className="p-[2px] bg-white rounded-full">
        {image ? (
          <img src={image} alt={name} className="w-16 h-16 rounded-full object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-lg font-bold text-primary-500">
            {name.charAt(0)}
          </div>
        )}
      </div>
    </div>
    <span className="text-[11px] font-medium text-text-secondary max-w-16 truncate text-center leading-tight">
      {name}
    </span>
  </button>
);

export default StoryCard;
