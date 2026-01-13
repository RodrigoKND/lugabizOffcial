import React from 'react';
import { motion } from 'framer-motion';
import { Category } from '../types';
import * as Icons from 'lucide-react';
import { Link } from 'react-router-dom';

interface CategoryCardProps {
  category: Category;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  const IconComponent = Icons[category.icon as keyof typeof Icons] as React.ComponentType<{ className?: string }>;

  return (
    <motion.section
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      className="cursor-pointer group"
    >
      <Link to={`/category/${category.id}`} className="block w-full md:w-max">
        <div
          className="p-6 rounded-2xl shadow-lg hover:shadow-xl w-full transition-all duration-300"
          style={{ backgroundColor: category.color }}
        >
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <IconComponent className="text-[#fff]" />
            </div>
            <h3 className="text-white font-semibold text-lg">
              {category.name}
            </h3>
            <p className="text-white/80 text-sm text-center">
              {category.description}
            </p>
          </div>
        </div>
      </Link>
    </motion.section>
  );
};
export default CategoryCard;