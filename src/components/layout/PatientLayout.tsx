import { Outlet } from 'react-router-dom';
import { PatientSidebar } from './PatientSidebar';

export const PatientLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen w-full bg-background">
      <PatientSidebar />
      <main className="flex-1 overflow-auto">
        <div className="container py-6 px-4 md:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
