import React, { useState } from 'react';
import api from '../../../api/axios';
import { getApiErrorMessage } from '../../../api/errors';
import type { MenuCategory } from '../../../hooks/useMenuCategories';

interface EditCategoryModalProps {
  category: MenuCategory;
  onClose: () => void;
  onSuccess: () => void;
}

const EditCategoryModal: React.FC<EditCategoryModalProps> = ({ category, onClose, onSuccess }) => {
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description ?? '');
  const [displayOrder, setDisplayOrder] = useState(
    category.display_order === null || category.display_order === undefined
      ? ''
      : String(category.display_order)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Category name is required.');
      return;
    }

    let parsedDisplayOrder: number | null = null;
    if (displayOrder.trim().length > 0) {
      const parsed = Number(displayOrder);
      if (!Number.isInteger(parsed)) {
        setError('Display order must be a whole number.');
        return;
      }
      parsedDisplayOrder = parsed;
    }

    setSaving(true);

    try {
      await api.put(`/api/menu/categories/${category.id}`, {
        name: name.trim(),
        description: description.trim().length > 0 ? description.trim() : null,
        display_order: parsedDisplayOrder,
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to update the category.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="glass-card w-full max-w-2xl p-6">
        <div className="mb-5">
          <h3 className="text-xl font-semibold">Edit Category</h3>
          <p className="text-muted mt-2 text-sm">Update the category details and ordering.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-[#FF4C6A]/30 bg-[#FF4C6A]/10 px-4 py-3 text-sm text-[#FF4C6A]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/70">Name</label>
            <input
              className="input-field"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Category name"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/70">Description</label>
            <textarea
              className="input-field min-h-24 resize-none"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Optional description"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/70">Display Order</label>
            <input
              className="input-field"
              value={displayOrder}
              onChange={(event) => setDisplayOrder(event.target.value)}
              placeholder="e.g. 1"
              type="number"
              min={0}
              step={1}
            />
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <button type="button" className="btn-ghost px-5 py-2 text-sm" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary px-5 py-2 text-sm"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCategoryModal;
