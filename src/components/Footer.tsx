import React from 'react';
import { Heart, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    // <footer className="bg-gray-900 text-white">
    //   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    //     <div className="flex flex-col items-center space-y-4">
    //       <div className="flex items-center space-x-2">
    //         <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-tomato rounded-lg flex items-center justify-center">
    //           <MapPin className="w-5 h-5 text-white" />
    //         </div>
    //         <span className="text-xl font-bold bg-gradient-to-r from-primary-400 to-tomato bg-clip-text text-transparent">
    //           Lugabiz
    //         </span>
    //       </div>
    //       <p className="text-gray-400 text-center max-w-md">
    //         Descubre lugares únicos y comparte tus favoritos con la comunidad.
    //       </p>
    //       <p className="text-gray-400 text-center max-w-md">
    //         Próximamente nuevas actualizaciones
    //       </p>
    //       <div className="flex items-center space-x-1 text-gray-400">
    //         <span>Hecho con</span>
    //         <Heart className="w-4 h-4 text-red-500" />
    //         <span>para la comunidad</span>
    //       </div>
    //     </div>
    //   </div>
    // </footer>

    <footer className="bg-white shadow-sm dark:bg-gray-900">
      <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <a href="#" className="flex items-center mb-4 sm:mb-0 space-x-3 rtl:space-x-reverse">
            <MapPin className='w-8 h-8 text-purple-300' />
            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
              Lugabiz
            </span>
          </a>
          <ul className="flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0 dark:text-gray-400">
            <li>
              <a href="#" className="hover:underline flex gap-2 me-4 md:me-6">
                <span>Hecho con</span>
                <Heart className="w-4 h-4 text-red-500" />
                <span>para la comunidad</span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;