import type { ReactNode } from 'react';

interface FretboardContainerProps {
  children: ReactNode;
}

export default function FretboardContainer({ children }: FretboardContainerProps) {
  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[800px]">
        {children}
      </div>
    </div>
  );
}
