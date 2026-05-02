import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="shadow-sm bg-gray-900">
      <div className="w-full py-8 px-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center lg:justify-between justify-center flex-wrap">
          <a href="#" className="text-2xl font-semibold text-white">
            Lugabiz
          </a>
          <ul className="flex flex-wrap items-center mb-6 text-md font-medium sm:mb-0 text-gray-400">
            <li>
              <a href="#" className="hover:underline flex gap-2 text-purple-100">
                <span>Lo local no deberia</span>
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