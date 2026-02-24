import { useState } from 'react';
import { Button, Input } from '../shared';
import type { CreateBeanInput } from '../../types';

interface BeanFormProps {
  initialValues?: Partial<CreateBeanInput>;
  onSubmit: (values: CreateBeanInput) => void;
  onCancel?: () => void;
  submitLabel?: string;
  isLoading?: boolean;
}

export function BeanForm({
  initialValues = {},
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  isLoading = false,
}: BeanFormProps) {
  const [name, setName] = useState(initialValues.name || '');
  const [roaster, setRoaster] = useState(initialValues.roaster || '');
  const [roastDate, setRoastDate] = useState(initialValues.roastDate || '');
  const [notes, setNotes] = useState(initialValues.notes || '');

  const [errors, setErrors] = useState<{ name?: string; roaster?: string }>({});

  const validate = (): boolean => {
    const newErrors: { name?: string; roaster?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Bean name is required';
    }
    if (!roaster.trim()) {
      newErrors.roaster = 'Roaster is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    onSubmit({
      name: name.trim(),
      roaster: roaster.trim(),
      roastDate: roastDate || null,
      notes: notes.trim(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Bean Name"
        placeholder="e.g., Ethiopia Yirgacheffe"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
        disabled={isLoading}
      />

      <Input
        label="Roaster"
        placeholder="e.g., Square Mile"
        value={roaster}
        onChange={(e) => setRoaster(e.target.value)}
        error={errors.roaster}
        disabled={isLoading}
      />

      <Input
        label="Roast Date (optional)"
        type="date"
        value={roastDate}
        onChange={(e) => setRoastDate(e.target.value)}
        disabled={isLoading}
      />

      <div>
        <label className="block text-xs text-espresso-700/60 dark:text-steam-300 mb-1">
          Notes (optional)
        </label>
        <textarea
          className="
            w-full px-3 py-2 rounded-lg
            bg-crema-50 dark:bg-roast-800
            border border-crema-200 dark:border-roast-600
            text-espresso-900 dark:text-steam-50
            placeholder:text-crema-400 dark:placeholder:text-steam-400
            focus:outline-none focus:border-caramel-500 focus:ring-2 focus:ring-caramel-500/20
            disabled:opacity-50 disabled:cursor-not-allowed
            resize-none
          "
          rows={3}
          placeholder="Tasting notes, origin info, etc."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="flex gap-2 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
