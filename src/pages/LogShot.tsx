import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useBeanStore } from '../stores/beanStore';
import { useShotStore } from '../stores/shotStore';
import { ShotForm, ShotComparison } from '../components/shot';
import { Button } from '../components/shared';
import type { CreateShotInput, Shot } from '../types';

type PageState = 'form' | 'result';

export function LogShot() {
  const { id: beanId } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isRedial = searchParams.get('redial') === 'true';

  const { currentBean, loadBean, dialBean } = useBeanStore();
  const { shots, latestShot, addShot, loadShots, isLoading: shotLoading } = useShotStore();

  const [pageState, setPageState] = useState<PageState>('form');
  const [justLoggedShot, setJustLoggedShot] = useState<typeof latestShot>(null);
  const [isDialing, setIsDialing] = useState(false);

  useEffect(() => {
    if (beanId) {
      loadBean(beanId);
      loadShots(beanId);
    }
  }, [beanId, loadBean, loadShots]);

  if (!beanId) {
    return <div className="p-4">Invalid bean ID</div>;
  }

  if (!currentBean) {
    return (
      <div className="px-5 pt-12 pb-4">
        <p className="text-espresso-700 dark:text-steam-200">Loading...</p>
      </div>
    );
  }

  // Determine what to pre-fill
  const getPrefillShot = () => {
    if (isRedial) {
      // For re-dial, start fresh (or from dialed recipe)
      if (currentBean.dialedRecipe) {
        const { doseGrams, yieldGrams, timeSeconds, grindSetting } = currentBean.dialedRecipe;
        return { doseGrams, yieldGrams, timeSeconds, grindSetting } satisfies Pick<Shot, 'doseGrams' | 'yieldGrams' | 'timeSeconds' | 'grindSetting'>;
      }
      return null;
    }
    // For continue dialing, use latest shot
    return latestShot;
  };

  const handleSubmit = async (input: CreateShotInput) => {
    try {
      const shot = await addShot(input);
      setJustLoggedShot(shot);
      setPageState('result');
    } catch (e) {
      // Error handled in store
    }
  };

  const handleMarkAsDialed = async () => {
    if (!justLoggedShot) return;
    setIsDialing(true);
    try {
      await dialBean(beanId, justLoggedShot.id);
      navigate(`/bean/${beanId}`);
    } catch (e) {
      // Error handled in store
    } finally {
      setIsDialing(false);
    }
  };

  const handleLogAnother = () => {
    setJustLoggedShot(null);
    setPageState('form');
  };

  const handleDone = () => {
    navigate(`/bean/${beanId}`);
  };

  // Get previous shot for comparison (the one before the just-logged shot)
  const previousShot = shots.length >= 2 && justLoggedShot
    ? shots.find(s => s.shotNumber === justLoggedShot.shotNumber - 1) || null
    : null;

  return (
    <div>
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <button
          onClick={() => navigate(`/bean/${beanId}`)}
          className="flex items-center gap-1 text-sm text-espresso-700/70 dark:text-steam-300 mb-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {currentBean.name}
        </button>
        <h1 className="text-2xl font-semibold">
          {pageState === 'form' ? 'Log Shot' : `Shot #${justLoggedShot?.shotNumber}`}
        </h1>
        {pageState === 'form' && (
          <p className="text-sm text-espresso-700/70 dark:text-steam-200 mt-1">
            {isRedial
              ? 'Starting fresh dial-in'
              : shots.length > 0
              ? `Shot #${shots.length + 1}`
              : 'First shot for this bean'}
          </p>
        )}
      </header>

      <main className="px-4 pb-4">
        {pageState === 'form' ? (
          <ShotForm
            beanId={beanId}
            previousShot={getPrefillShot()}
            onSubmit={handleSubmit}
            onCancel={() => navigate(`/bean/${beanId}`)}
            isLoading={shotLoading}
          />
        ) : justLoggedShot ? (
          <div className="space-y-4">
            <ShotComparison
              currentShot={justLoggedShot}
              previousShot={previousShot}
              onMarkAsDialed={handleMarkAsDialed}
              isDialLoading={isDialing}
            />

            <div className="flex gap-2 pt-2">
              <Button variant="secondary" onClick={handleLogAnother} className="flex-1">
                Log Another
              </Button>
              <Button variant="ghost" onClick={handleDone} className="flex-1">
                Done
              </Button>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
