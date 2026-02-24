import { useState, useRef } from 'react';
import { Button, Card, ConfirmModal } from '../components/shared';
import { exportData, downloadExport } from '../utils/export';
import { previewImport, importData, readFileAsJSON } from '../utils/import';
import type { ImportPreview } from '../utils/import';
import { resetDatabase } from '../db';
import { useBeanStore } from '../stores/beanStore';
import { useShotStore } from '../stores/shotStore';
import { useThemeStore } from '../stores/themeStore';
import type { DataExport } from '../types';

export function Settings() {
  const [isExporting, setIsExporting] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  // Import state
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [importFile, setImportFile] = useState<DataExport | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { loadBeans } = useBeanStore();
  const { clearShots } = useShotStore();
  const { mode, setMode } = useThemeStore();

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await readFileAsJSON(file);
      const preview = previewImport(data);
      setImportPreview(preview);

      if (preview.isValid) {
        setImportFile(data as DataExport);
        setShowImportModal(true);
      }
    } catch (err) {
      setImportPreview({
        isValid: false,
        error: 'Failed to read file',
        beanCount: 0,
        shotCount: 0,
      });
    }

    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImport = async () => {
    if (!importFile) return;

    setIsImporting(true);
    try {
      await importData(importFile);
      clearShots();
      await loadBeans();
      setShowImportModal(false);
      setImportFile(null);
      setImportPreview(null);
    } catch (e) {
      console.error('Import failed:', e);
    } finally {
      setIsImporting(false);
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
          Manage your data and preferences
        </p>
      </header>

      <main className="px-4 pb-4 space-y-4">
        {/* Theme Selection */}
        <Card>
          <h2 className="font-medium text-espresso-900 dark:text-steam-50 mb-3">
            Appearance
          </h2>
          <div className="flex gap-2">
            {(['light', 'dark', 'system'] as const).map((option) => (
              <button
                key={option}
                onClick={() => setMode(option)}
                className={`
                  flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors
                  ${mode === option
                    ? 'bg-caramel-500 text-white'
                    : 'bg-crema-100 dark:bg-roast-800 text-espresso-700 dark:text-steam-200'
                  }
                `}
              >
                {option.charAt(0).toUpperCase() + option.slice(1)}
              </button>
            ))}
          </div>
        </Card>

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

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileSelect}
              className="hidden"
            />

            <Button
              variant="secondary"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              Import Data
            </Button>

            {/* Import error display */}
            {importPreview && !importPreview.isValid && (
              <p className="text-sm text-red-500 mt-2">{importPreview.error}</p>
            )}

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
            <p>Version 0.2.0 (Phase 0 Beta)</p>
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

      {/* Import Confirmation Modal */}
      <ConfirmModal
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false);
          setImportFile(null);
        }}
        onConfirm={handleImport}
        title="Import Data?"
        message={`This will replace all your current data with:\n\n• ${importPreview?.beanCount || 0} beans\n• ${importPreview?.shotCount || 0} shots\n\nExported on: ${importPreview?.exportDate ? new Date(importPreview.exportDate).toLocaleDateString() : 'Unknown'}\n\nThis action cannot be undone.`}
        confirmLabel={isImporting ? 'Importing...' : 'Replace All Data'}
        cancelLabel="Cancel"
        variant="danger"
      />

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
