import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBeanStore } from '../stores/beanStore';
import { useShotStore } from '../stores/shotStore';
import { getShotsForBean } from '../db';
import { BeanRecipe, BeanForm, ShotList } from '../components/bean';
import {
  Button,
  Card,
  StarRating,
  ConfirmModal,
} from '../components/shared';
import type { Shot } from '../types';

export function BeanDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentBean, loadBean, editBean, removeBean, isLoading } = useBeanStore();
  const { removeShot } = useShotStore();

  const [shots, setShots] = useState<Shot[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadBean(id);
      getShotsForBean(id).then(setShots);
    }
  }, [id, loadBean]);

  if (!currentBean) {
    return (
      <div className="px-5 pt-12 pb-4">
        <p className="text-espresso-700 dark:text-steam-200">
          {isLoading ? 'Loading...' : 'Bean not found'}
        </p>
      </div>
    );
  }

  const handleRatingChange = async (rating: number) => {
    await editBean({ id: currentBean.id, rating });
  };

  const handleDelete = async () => {
    await removeBean(currentBean.id);
    navigate('/');
  };

  const handleEditSubmit = async (values: { name: string; roaster: string; roastDate?: string | null; notes?: string }) => {
    await editBean({ id: currentBean.id, ...values });
    setIsEditing(false);
  };

  return (
    <div>
      {/* Header */}
      <header className="px-5 pt-12 pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold truncate">{currentBean.name}</h1>
            <p className="text-sm text-espresso-700/70 dark:text-steam-200 mt-0.5">
              {currentBean.roaster}
            </p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="ml-2 p-2 text-espresso-700/50 dark:text-steam-400 hover:text-espresso-900 dark:hover:text-steam-50"
            aria-label={isEditing ? 'Cancel editing' : 'Edit bean'}
          >
            {isEditing ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            )}
          </button>
        </div>

        {/* Rating */}
        {!isEditing && (
          <div className="mt-3">
            <StarRating
              value={currentBean.rating}
              onChange={handleRatingChange}
            />
          </div>
        )}
      </header>

      <main className="px-4 pb-4 space-y-4">
        {isEditing ? (
          <>
            <BeanForm
              initialValues={{
                name: currentBean.name,
                roaster: currentBean.roaster,
                roastDate: currentBean.roastDate || undefined,
                notes: currentBean.notes,
              }}
              onSubmit={handleEditSubmit}
              onCancel={() => setIsEditing(false)}
              submitLabel="Save Changes"
              isLoading={isLoading}
            />
            <Button
              variant="ghost"
              onClick={() => setShowDeleteModal(true)}
              className="w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
            >
              Delete Bean
            </Button>
          </>
        ) : (
          <>
            {/* Dialed Recipe */}
            {currentBean.dialedRecipe && (
              <BeanRecipe
                recipe={currentBean.dialedRecipe}
                grindSetting={currentBean.dialedRecipe.grindSetting}
              />
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              {currentBean.isDialedIn ? (
                <>
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={() => navigate(`/bean/${currentBean.id}/shot`)}
                  >
                    Log a Shot
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => navigate(`/bean/${currentBean.id}/shot?redial=true`)}
                  >
                    Re-dial
                  </Button>
                </>
              ) : (
                <Button
                  className="flex-1"
                  onClick={() => navigate(`/bean/${currentBean.id}/shot`)}
                >
                  {shots.length > 0 ? 'Continue Dialing' : 'Start Dialing'}
                </Button>
              )}
            </div>

            {/* Notes */}
            {currentBean.notes && (
              <Card>
                <h3 className="text-sm font-medium text-espresso-700 dark:text-steam-200 mb-1">
                  Notes
                </h3>
                <p className="text-sm text-espresso-700/70 dark:text-steam-300">
                  {currentBean.notes}
                </p>
              </Card>
            )}

            {/* Shot History */}
            <ShotList
              shots={shots}
              beanId={currentBean.id}
              onDeleteShot={async (shotId) => {
                await removeShot(shotId, currentBean.id);
                const updatedShots = await getShotsForBean(currentBean.id);
                setShots(updatedShots);
              }}
            />
          </>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Bean?"
        message={`Are you sure you want to delete "${currentBean.name}"? This will also delete all ${shots.length} shot${shots.length !== 1 ? 's' : ''} logged for this bean. This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
      />
    </div>
  );
}
