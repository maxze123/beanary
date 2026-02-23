import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-crema-50 dark:bg-roast-950 text-espresso-900 dark:text-steam-50">
      <div className="max-w-[375px] mx-auto min-h-screen pb-24">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
