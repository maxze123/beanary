import { useEffect, useState } from 'react';
import { useBeanStore } from '../stores/beanStore';
import { BeanCard } from '../components/bean';
import { EmptyState, Button } from '../components/shared';
import { useNavigate } from 'react-router-dom';
import { countShotsForBean } from '../db';

export function Library() {
  const navigate = useNavigate();
  const { beans, isLoading, loadBeans } = useBeanStore();
  const [shotCounts, setShotCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    loadBeans();
  }, [loadBeans]);

  // Load shot counts for all beans
  useEffect(() => {
    const loadCounts = async () => {
      const counts: Record<string, number> = {};
      for (const bean of beans) {
        counts[bean.id] = await countShotsForBean(bean.id);
      }
      setShotCounts(counts);
    };
    if (beans.length > 0) {
      loadCounts();
    }
  }, [beans]);

  if (isLoading && beans.length === 0) {
    return (
      <div className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-semibold">Your Beans</h1>
        <p className="text-sm text-espresso-700/70 dark:text-steam-200 mt-1">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-semibold">Your Beans</h1>
        {beans.length > 0 && (
          <p className="text-sm text-espresso-700/70 dark:text-steam-200 mt-1">
            {beans.length} coffee{beans.length !== 1 ? 's' : ''} in your library
          </p>
        )}
      </header>

      {/* Bean List */}
      <main className="px-4 pb-4">
        {beans.length === 0 ? (
          <EmptyState
            icon={
              <svg
                className="w-16 h-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
                />
              </svg>
            }
            title="No beans yet"
            description="Add your first coffee to start tracking your dial-in journey."
            action={
              <Button onClick={() => navigate('/bean/new')}>
                Add Your First Bean
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {beans.map((bean) => (
              <BeanCard
                key={bean.id}
                bean={bean}
                shotCount={shotCounts[bean.id] || 0}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
