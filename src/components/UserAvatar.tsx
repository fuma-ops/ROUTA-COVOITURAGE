import React, { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

interface UserAvatarProps {
  name: string;
  photo?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  verified?: boolean;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  photo,
  size = 'md',
  verified = false,
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-14 h-14 text-base',
    xl: 'w-20 h-20 text-xl font-bold',
  };

  const badgeSizes = {
    sm: 'w-3.5 h-3.5 -bottom-0.5 -right-0.5',
    md: 'w-4 h-4 -bottom-0.5 -right-0.5',
    lg: 'w-5 h-5 bottom-0 right-0',
    xl: 'w-6 h-6 bottom-0.5 right-0.5',
  };

  // Get initials
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  // Consistent pleasant gradient based on name
  const getGradient = (str: string) => {
    const gradients = [
      'from-rose-500 to-amber-600',
      'from-teal-600 to-emerald-700',
      'from-indigo-600 to-rose-600',
      'from-amber-600 to-red-600',
      'from-sky-600 to-indigo-700',
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return gradients[Math.abs(hash) % gradients.length];
  };

  return (
    <div className={`relative inline-block shrink-0 ${className}`}>
      {photo && !imageError ? (
        <img
          src={photo}
          alt={name}
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
          className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-white shadow-sm`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full bg-gradient-to-tr ${getGradient(
            name
          )} text-white flex items-center justify-center font-semibold ring-2 ring-white shadow-sm`}
        >
          {initials || 'U'}
        </div>
      )}

      {verified && (
        <span
          className={`absolute ${badgeSizes[size]} bg-white text-emerald-600 rounded-full flex items-center justify-center shadow-xs`}
          title="Profil vérifié"
        >
          <CheckCircle2 className="w-full h-full fill-emerald-500 text-white" />
        </span>
      )}
    </div>
  );
};
