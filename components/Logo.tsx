import React from 'react';

interface LogoProps {
  className?: string;
  withText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "w-8 h-8", withText = false }) => {
  return (
    <div className="flex items-center gap-2">
      <img
        src="/branding/logo.png"
        alt="LedCover"
        className={`rounded-xl object-cover shadow-sm ${className}`}
        draggable={false}
      />
      
      {withText && (
        <h1 className="font-bold text-lg md:text-xl tracking-tight text-slate-900">
          Led<span className="text-violet-600 font-normal">Cover</span>
        </h1>
      )}
    </div>
  );
};

export default Logo;
