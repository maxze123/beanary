import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShotStore } from '../stores/shotStore';
import { useBeanStore } from '../stores/beanStore';
import { Button, Card, ConfirmModal } from '../components/shared';
import { ShotForm } from '../components/shot';
import { formatRatio, getBalanceLabel, getBalanceColor } from '../utils/calculations';
import type { CreateShotInput } from '../types';

export function ShotDetail() {
  const { beanId, shotId } = useParams<{ beanId: string; shotId: string }>();
  const navigate = useNavigate();

  const { currentBean, loadBean } = useBeanStore();
  const { shots, loadShots, editShot, removeShot, isLoading } = useShotStore();

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (beanId) {
      loadBean(beanId);
      loadShots(beanId);
    }
  }, [beanId, loadBean, loadShots]);

  const shot = shots.find((s) => s.id === shotId);

  if (!shot || !currentBean) {
    return (
      <div className="px-5 pt-12 pb-4">
        <p className="text-espresso-700 dark:text-steam-200">
          {isLoading ? 'Loading...' : 'Shot not found'}
        </p>
      </div>
    );
  }

  const handleEdit = async (input: CreateShotInput) => {
    await editShot(shot.id, {
      doseGrams: input.doseGrams,
      yieldGrams: input.yieldGrams,
      timeSeconds: input.timeSeconds,
      grindSetting: input.grindSetting,
      taste: input.taste,
      notes: input.notes,
    });
    setIsEditing(false);
  };

  const handleDelete = async () => {
    await removeShot(shot.id, currentBean.id);
    navigate(`/bean/${currentBean.id}`);
  };

  return (
    <div>
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <button
          onClick={() => navigate(`/bean/${currentBean.id}`)}
          className="flex items-center gap-1 text-sm text-espresso-700/70 dark:text-steam-300 mb-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {currentBean.name}
        </button>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Shot #{shot.shotNumber}</h1>
          {!isEditing && (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-espresso-700/50 dark:text-steam-400 hover:text-espresso-900 dark:hover:text-steam-50"
                aria-label="Edit shot"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="p-2 text-red-500/70 hover:text-red-500"
                aria-label="Delete shot"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="px-4 pb-4">
        {isEditing ? (
          <div className="space-y-4">
            <ShotForm
              beanId={currentBean.id}
              previousShot={shot}
              onSubmit={handleEdit}
              onCancel={() => setIsEditing(false)}
              submitLabel="Save Changes"
              isLoading={isLoading}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Shot Details Card */}
            <Card>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-espresso-700/60 dark:text-steam-300">Dose</span>
                  <p className="text-lg font-semibold text-espresso-900 dark:text-steam-50">
                    {shot.doseGrams}g
                  </p>
                </div>
                <div>
                  <span className="text-xs text-espresso-700/60 dark:text-steam-300">Yield</span>
                  <p className="text-lg font-semibold text-espresso-900 dark:text-steam-50">
                    {shot.yieldGrams}g
                  </p>
                </div>
                <div>
                  <span className="text-xs text-espresso-700/60 dark:text-steam-300">Time</span>
                  <p className="text-lg font-semibold text-espresso-900 dark:text-steam-50">
                    {shot.timeSeconds}s
                  </p>
                </div>
                <div>
                  <span className="text-xs text-espresso-700/60 dark:text-steam-300">Ratio</span>
                  <p className="text-lg font-semibold text-espresso-900 dark:text-steam-50">
                    {formatRatio(shot.ratio)}
                  </p>
                </div>
                {shot.grindSetting && (
                  <div className="col-span-2">
                    <span className="text-xs text-espresso-700/60 dark:text-steam-300">Grind</span>
                    <p className="text-lg font-semibold text-espresso-900 dark:text-steam-50">
                      {shot.grindSetting}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Taste */}
            <Card>
              <span className="text-xs text-espresso-700/60 dark:text-steam-300">Taste</span>
              <p className={`text-lg font-semibold ${getBalanceColor(shot.taste.balance)}`}>
                {getBalanceLabel(shot.taste.balance)}
              </p>
            </Card>

            {/* Notes */}
            {shot.notes && (
              <Card>
                <span className="text-xs text-espresso-700/60 dark:text-steam-300">Notes</span>
                <p className="text-espresso-900 dark:text-steam-50 mt-1">{shot.notes}</p>
              </Card>
            )}

            {/* Dialed indicator */}
            {shot.isDialedShot && (
              <Card className="bg-dialed-light dark:bg-dialed-dm-bg border-dialed/30 dark:border-dialed-dm-text/30">
                <div className="flex items-center gap-2 text-dialed-dark dark:text-dialed-dm-text">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">This is your dialed recipe</span>
                </div>
              </Card>
            )}

            {/* Timestamp */}
            <p className="text-xs text-espresso-700/50 dark:text-steam-400 text-center">
              Logged {new Date(shot.createdAt).toLocaleString()}
            </p>

            {/* Back button */}
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => navigate(`/bean/${currentBean.id}`)}
            >
              Back to Bean
            </Button>
          </div>
        )}
      </main>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Shot?"
        message={`Delete Shot #${shot.shotNumber}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
      />
    </div>
  );
}
