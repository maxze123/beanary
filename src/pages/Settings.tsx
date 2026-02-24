import { useState, useRef } from 'react';
import { Button, Card, ConfirmModal, Select, InfoModal } from '../components/shared';
import { exportData, downloadExport } from '../utils/export';
import { previewImport, importData, readFileAsJSON } from '../utils/import';
import type { ImportPreview } from '../utils/import';
import { resetDatabase } from '../db';
import { useBeanStore } from '../stores/beanStore';
import { useShotStore } from '../stores/shotStore';
import { useThemeStore } from '../stores/themeStore';
import { useSettingsStore } from '../stores/settingsStore';
import { trackTelemetryToggle, TELEMETRY_DATA_POINTS, TELEMETRY_NOT_COLLECTED } from '../lib';
import { COMMON_GRINDERS, COMMON_MACHINES } from '../types';
import type { DataExport } from '../types';

export function Settings() {
  const [isExporting, setIsExporting] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showTelemetryInfo, setShowTelemetryInfo] = useState(false);

  // Import state
  const [importPreview, setImportPreview] = useState<ImportPreview | null>(null);
  const [importFile, setImportFile] = useState<DataExport | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { loadBeans } = useBeanStore();
  const { clearShots } = useShotStore();
  const { mode, setMode } = useThemeStore();
  const { equipment, telemetryEnabled, setEquipment, setTelemetryEnabled } = useSettingsStore();

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

        {/* Equipment Profile */}
        <Card>
          <h2 className="font-medium text-espresso-900 dark:text-steam-50 mb-3">
            My Equipment
          </h2>
          <p className="text-sm text-espresso-700/70 dark:text-steam-300 mb-4">
            Help us provide better recommendations by telling us what you use.
          </p>
          <div className="space-y-3">
            <Select
              label="Grinder"
              placeholder="Select your grinder..."
              value={equipment.grinder}
              onChange={(e) => setEquipment({ grinder: e.target.value })}
              options={COMMON_GRINDERS.map((g) => ({ value: g, label: g }))}
            />
            <Select
              label="Machine"
              placeholder="Select your machine..."
              value={equipment.machine}
              onChange={(e) => setEquipment({ machine: e.target.value })}
              options={COMMON_MACHINES.map((m) => ({ value: m, label: m }))}
            />
          </div>
        </Card>

        {/* Anonymous Telemetry */}
        <Card>
          <div className="flex items-start justify-between mb-3">
            <h2 className="font-medium text-espresso-900 dark:text-steam-50">
              Help Improve Beanary
            </h2>
            <button
              onClick={() => setShowTelemetryInfo(true)}
              className="p-1 text-espresso-700/50 dark:text-steam-400 hover:text-caramel-500"
              aria-label="Learn more about telemetry"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          </div>
          <p className="text-sm text-espresso-700/70 dark:text-steam-300 mb-4">
            Share anonymous dial-in data to help us build better recommendations for everyone.
          </p>
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={telemetryEnabled}
                onChange={(e) => {
                  setTelemetryEnabled(e.target.checked);
                  trackTelemetryToggle(e.target.checked);
                }}
                className="sr-only"
              />
              <div className={`
                w-10 h-6 rounded-full transition-colors
                ${telemetryEnabled ? 'bg-caramel-500' : 'bg-crema-300 dark:bg-roast-600'}
              `}>
                <div className={`
                  absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform
                  ${telemetryEnabled ? 'translate-x-4' : 'translate-x-0'}
                `} />
              </div>
            </div>
            <span className="text-sm text-espresso-900 dark:text-steam-50">
              Share anonymous data
            </span>
          </label>
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
            <p>Version 0.3.0 (Phase 0 Beta)</p>
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

      {/* Telemetry Info Modal */}
      <InfoModal
        isOpen={showTelemetryInfo}
        onClose={() => setShowTelemetryInfo(false)}
        title="About Anonymous Data Sharing"
      >
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-espresso-900 dark:text-steam-50 mb-2">
              What we collect:
            </h3>
            <ul className="text-sm text-espresso-700/70 dark:text-steam-300 space-y-1">
              {TELEMETRY_DATA_POINTS.map((point) => (
                <li key={point} className="flex items-start gap-2">
                  <span className="text-dialed dark:text-dialed-dm-text">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-espresso-900 dark:text-steam-50 mb-2">
              What we never collect:
            </h3>
            <ul className="text-sm text-espresso-700/70 dark:text-steam-300 space-y-1">
              {TELEMETRY_NOT_COLLECTED.map((point) => (
                <li key={point} className="flex items-start gap-2">
                  <span className="text-red-500">✕</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-sm text-espresso-700/70 dark:text-steam-300">
            This data helps us understand what equipment and beans are popular, and improve our dial-in recommendations for everyone.
          </p>
        </div>
      </InfoModal>
    </div>
  );
}
