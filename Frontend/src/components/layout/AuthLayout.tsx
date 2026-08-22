import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Compass } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
        <Link to="/" className="inline-flex items-center gap-2.5 group">
          <div className="w-12 h-12 rounded-full bg-brand flex items-center justify-center text-ink shadow-sm group-hover:scale-105 transition-transform">
            <Compass className="w-7 h-7 stroke-[2.5]" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-ink">
            Globe<span className="text-brand-dark">Trotter</span>
          </span>
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Outlet />
      </div>
    </div>
  );
};
