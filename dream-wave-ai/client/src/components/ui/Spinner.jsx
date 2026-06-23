import React from 'react';

export default function Spinner({ size = 'md', text = '' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-10 h-10', lg: 'w-16 h-16' };
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4"
      style={{ background: '#0B0F19' }}>
      <div className={`${sizes[size]} border-2 rounded-full spin`}
        style={{ borderColor: 'rgba(59,130,246,0.2)', borderTopColor: '#3b82f6' }} />
      {text && <p className="text-sm" style={{ color: '#64748b' }}>{text}</p>}
    </div>
  );
}
