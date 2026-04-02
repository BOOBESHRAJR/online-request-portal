import React from 'react';
import { FileSearch } from 'lucide-react';

const Logo = ({ className = "text-blue-600", iconSize = 24, textSize = "text-xl", showText = true }) => {
  return (
    <div className={`flex items-center gap-2.5 font-black tracking-tight ${className}`}>
      <div className="bg-blue-600 p-1.5 rounded-xl text-white shadow-lg shadow-blue-200">
        <FileSearch size={iconSize} strokeWidth={2.5} />
      </div>
      {showText && (
        <span className={`${textSize} text-slate-800`}>
          Request<span className="text-blue-600">Portal</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
