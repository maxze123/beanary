import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Shot } from '../../types';
import { Card, ConfirmModal } from '../shared';
import { getBalanceLabel, getBalanceColor } from '../../utils/calculations';

interface ShotListProps {
  shots: Shot[];
  beanId: string;
  onDeleteShot?: (shotId: string) => void;
}

export function ShotList({ shots, beanId, onDeleteShot }: ShotListProps) {
  const navigate = useNavigate();
  const [swipedShotId, setSwipedShotId] = useState<string | null>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [shotToDelete, setShotToDelete] = useState<Shot | null>(null);

  if (shots.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-espresso-700/50 dark:text-steam-400 text-sm">
          No shots logged yet
        </p>
        <p className="text-espresso-700/40 dark:text-steam-500 text-xs mt-1">
          Tap the button above to log your first shot
        </p>
      </div>
    );
  }

  const handleTouchStart = (e: React.TouchEvent, shotId: string) => {
    setTouchStart(e.touches[0].clientX);
    if (swipedShotId !== shotId) {
      setSwipedShotId(null);
    }
  };

  const handleTouchMove = (e: React.TouchEvent, shotId: string) => {
    if (touchStart === null) return;

    const touchEnd = e.touches[0].clientX;
    const diff = touchStart - touchEnd;

    if (diff > 50) {
      setSwipedShotId(shotId);
    } else if (diff < -50) {
      setSwipedShotId(null);
    }
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
  };

  const handleDeleteClick = (shot: Shot, e: React.MouseEvent) => {
    e.stopPropagation();
    setShotToDelete(shot);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (shotToDelete && onDeleteShot) {
      onDeleteShot(shotToDelete.id);
    }
    setShowDeleteModal(false);
    setShotToDelete(null);
    setSwipedShotId(null);
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-espresso-700 dark:text-steam-200">
        Shot History
      </h3>
      {shots.map((shot) => (
        <div
          key={shot.id}
          className="relative overflow-hidden rounded-2xl"
          onTouchStart={(e) => handleTouchStart(e, shot.id)}
          onTouchMove={(e) => handleTouchMove(e, shot.id)}
          onTouchEnd={handleTouchEnd}
        >
          {/* Delete button (revealed on swipe) */}
          <div
            className={`
              absolute right-0 top-0 bottom-0 w-20 bg-red-500
              flex items-center justify-center
              transition-opacity duration-200
              ${swipedShotId === shot.id ? 'opacity-100' : 'opacity-0'}
            `}
          >
            <button
              onClick={(e) => handleDeleteClick(shot, e)}
              className="text-white p-2"
              aria-label="Delete shot"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          {/* Shot card */}
          <Card
            padding="sm"
            className={`
              cursor-pointer active:scale-[0.99] transition-all duration-200
              ${shot.isDialedShot ? 'ring-2 ring-dialed dark:ring-dialed-dm-text' : ''}
              ${swipedShotId === shot.id ? '-translate-x-20' : 'translate-x-0'}
            `}
            onClick={() => navigate(`/bean/${beanId}/shot/${shot.id}`)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-espresso-700/50 dark:text-steam-400 w-6">
                  #{shot.shotNumber}
                </span>
                <div className="text-sm">
                  <span className="text-espresso-900 dark:text-steam-50">
                    {shot.doseGrams}g → {shot.yieldGrams}g
                  </span>
                  <span className="text-espresso-700/50 dark:text-steam-400 mx-2">
                    in {shot.timeSeconds}s
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-xs font-medium ${getBalanceColor(shot.taste.balance)}`}>
                  {getBalanceLabel(shot.taste.balance)}
                </span>
                {shot.isDialedShot && (
                  <div className="text-xs text-dialed dark:text-dialed-dm-text mt-0.5">
                    ★ Dialed
                  </div>
                )}
              </div>
            </div>
            {shot.notes && (
              <p className="text-xs text-espresso-700/60 dark:text-steam-300 mt-1 ml-9 truncate">
                {shot.notes}
              </p>
            )}
          </Card>
        </div>
      ))}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setShotToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Shot?"
        message={`Delete Shot #${shotToDelete?.shotNumber}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
      />
    </div>
  );
}
