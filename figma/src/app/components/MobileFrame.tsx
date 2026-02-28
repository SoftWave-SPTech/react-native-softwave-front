import { ReactNode } from 'react';

interface MobileFrameProps {
  children: ReactNode;
}

export function MobileFrame({ children }: MobileFrameProps) {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-[393px] h-[852px] bg-gray-50 rounded-3xl shadow-2xl overflow-hidden">
        {children}
      </div>
    </div>
  );
}
