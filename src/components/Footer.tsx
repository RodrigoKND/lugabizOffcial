import React from 'react';
import { Heart, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="shadow-sm bg-gray-900">
      <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <a href="#" className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse">
            <MapPin className='w-8 h-8 text-purple-300' />
            <span className="self-center text-2xl font-semibold whitespace-nowrap text-white">
              Lugabiz
            </span>
          </a>
          <ul className="flex flex-wrap items-center mb-6 text-sm font-medium sm:mb-0 text-gray-400">
            <li>
              <a href="#" className="hover:underline flex gap-2 me-4 md:me-6">
                <span>Lo local no deberia</span>
                <Heart className="w-4 h-4 text-red-500" />
                <span>ser invisible</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;