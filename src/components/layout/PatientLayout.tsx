import { Outlet } from 'react-router-dom';
import { PatientSidebar } from './PatientSidebar';
import { GracePeriodBanner } from '@/components/subscription/GracePeriodBanner';
import { SupportButton } from '../patient/support/SupportButton';

export const PatientLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <GracePeriodBanner />
      <PatientSidebar />
      <main className="flex-1 overflow-auto">
        <div className="flex justify-end p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
          <SupportButton />
        </div>
        <div className="container py-6 px-4 md:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
