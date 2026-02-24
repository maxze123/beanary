import { useState } from 'react';
import { Button, Card, ConfirmModal } from '../components/shared';
import { exportData, downloadExport } from '../utils/export';
import { resetDatabase } from '../db';
import { useBeanStore } from '../stores/beanStore';
import { useShotStore } from '../stores/shotStore';

export function Settings() {
  const [isExporting, setIsExporting] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const { loadBeans } = useBeanStore();
  const { clearShots } = useShotStore();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await exportData();
      downloadExport(data);
    } catch (e) {
      console.error('Export failed:', e);
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearData = async () => {
    setIsClearing(true);
    try {
      await resetDatabase();
      clearShots();
      await loadBeans();
    } catch (e) {
      console.error('Clear data failed:', e);
    } finally {
      setIsClearing(false);
      setShowClearModal(false);
    }
  };

  return (
    <div>
      <header className="px-5 pt-12 pb-4">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-espresso-700/70 dark:text-steam-200 mt-1">
          Manage your data
        </p>
      </header>

      <main className="px-4 pb-4 space-y-4">
        {/* Data Management */}
        <Card>
          <h2 className="font-medium text-espresso-900 dark:text-steam-50 mb-3">
            Your Data
          </h2>
          <p className="text-sm text-espresso-700/70 dark:text-steam-300 mb-4">
            All your data is stored locally on this device. Export regularly to keep a backup.
          </p>
          <div className="space-y-2">
            <Button
              variant="secondary"
              className="w-full"
              onClick={handleExport}
              disabled={isExporting}
            >
              {isExporting ? 'Exporting...' : 'Export Data (JSON)'}
            </Button>
            <Button
              variant="ghost"
              className="w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
              onClick={() => setShowClearModal(true)}
            >
              Clear All Data
            </Button>
          </div>
        </Card>

        {/* About */}
        <Card>
          <h2 className="font-medium text-espresso-900 dark:text-steam-50 mb-3">
            About Beanary
          </h2>
          <div className="space-y-2 text-sm text-espresso-700/70 dark:text-steam-300">
            <p>
              Beanary helps you dial in your espresso by tracking shots and remembering what worked.
            </p>
            <p>
              Version 0.1.0 (Phase 0 Beta)
            </p>
          </div>
        </Card>

        {/* How It Works */}
        <Card>
          <h2 className="font-medium text-espresso-900 dark:text-steam-50 mb-3">
            How It Works
          </h2>
          <ol className="space-y-2 text-sm text-espresso-700/70 dark:text-steam-300 list-decimal list-inside">
            <li>Add a new coffee bean to your library</li>
            <li>Log shots as you dial in, noting taste</li>
            <li>Follow the guidance to adjust your grind</li>
            <li>When it tastes great, mark it as &ldquo;Dialed&rdquo;</li>
            <li>Next time you buy this bean, your recipe is saved</li>
          </ol>
        </Card>

        {/* Tips */}
        <Card>
          <h2 className="font-medium text-espresso-900 dark:text-steam-50 mb-3">
            Quick Tips
          </h2>
          <ul className="space-y-2 text-sm text-espresso-700/70 dark:text-steam-300">
            <li className="flex gap-2">
              <span className="text-amber-500">●</span>
              <span><strong>Sour?</strong> Under-extracted. Try grinding finer.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-orange-500">●</span>
              <span><strong>Bitter?</strong> Over-extracted. Try grinding coarser.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-dialed dark:text-dialed-dm-text">●</span>
              <span><strong>Balanced?</strong> You&rsquo;re dialed in!</span>
            </li>
          </ul>
        </Card>

        {/* Install Hint */}
        <Card className="bg-caramel-100 dark:bg-caramel-500/20 border-caramel-200 dark:border-caramel-500/30">
          <h2 className="font-medium text-caramel-700 dark:text-caramel-300 mb-2">
            Install the App
          </h2>
          <p className="text-sm text-caramel-600 dark:text-caramel-400">
            For the best experience, add Beanary to your home screen. On iOS, tap the share button and &ldquo;Add to Home Screen&rdquo;. On Android, tap the menu and &ldquo;Install app&rdquo;.
          </p>
        </Card>
      </main>

      {/* Clear Data Confirmation */}
      <ConfirmModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={handleClearData}
        title="Clear All Data?"
        message="This will permanently delete all your beans and shots. This action cannot be undone. Consider exporting your data first."
        confirmLabel={isClearing ? 'Clearing...' : 'Clear Everything'}
        cancelLabel="Cancel"
        variant="danger"
      />
    </div>
  );
}
