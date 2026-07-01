import React from 'react';

export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-[360px] h-[780px] bg-white rounded-[48px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden relative border-[8px] border-white ring-1 ring-black/5">
      {children}
    </div>
  );
}
