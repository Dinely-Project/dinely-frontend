import React, { useState } from 'react';
import api from '../../../api/axios';
import { getApiErrorMessage, isAxiosError } from '../../../api/errors';
import { useMenuCategories, type MenuCategory } from '../../../hooks/useMenuCategories';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import EditCategoryModal from './EditCategoryModal';
import ToastNotification from '../../ToastNotification';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

let toastCounter = 0;

const MenuCategoriesPanel: React.FC = () => {
  const { categories, loading, error, refetch } = useMenuCategories();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editTarget, setEditTarget] = useState<MenuCategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MenuCategory | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = ++toastCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const dismissToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Category name is required.');
      return;
    }

    let parsedDisplayOrder: number | null = null;
    if (displayOrder.trim().length > 0) {
      const parsed = Number(displayOrder);
      if (!Number.isInteger(parsed)) {
        setFormError('Display order must be a whole number.');
        return;
      }
      parsedDisplayOrder = parsed;
    }

    setSaving(true);
    try {
      await api.post('/api/menu/categories', {
        name: name.trim(),
        description: description.trim().length > 0 ? description.trim() : null,
        display_order: parsedDisplayOrder,
      });
      setName('');
      setDescription('');
      setDisplayOrder('');
      await refetch();
      pushToast(`Category "${name.trim()}" created.`);
    } catch (err: unknown) {
      setFormError(getApiErrorMessage(err, 'Failed to create the category.'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setDeleteBusy(true);
    setDeleteError(null);

    try {
      const deletedName = deleteTarget.name;
      await api.delete(`/api/menu/categories/${deleteTarget.id}`);
      setDeleteTarget(null);
      await refetch();
      pushToast(`Category "${deletedName}" deleted.`);
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.status === 409) {
        setDeleteError('This category still contains menu items.');
        return;
      }
      setDeleteError(getApiErrorMessage(err, 'Failed to delete the category.'));
    } finally {
      setDeleteBusy(false);
    }
  };

  const handleEditSuccess = async () => {
    await refetch();
    pushToast('Category updated successfully.');
  };

  return (
    <>
      <div className="space-y-6">
        <div className="border-b border-white/5 pb-4">
          <h3 className="text-base font-semibold text-white">Categories</h3>
        </div>

        <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/70">Name *</label>
            <input
              className="input-field"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Breakfast"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/70">Description</label>
            <input
              className="input-field"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/70">Display Order</label>
            <input
              className="input-field"
              value={displayOrder}
              onChange={(event) => setDisplayOrder(event.target.value)}
              placeholder="1"
              type="number"
              min={0}
              step={1}
            />
          </div>
          <div className="md:col-span-3 flex flex-wrap items-center gap-3">
            <button type="submit" className="btn-primary px-5 py-2 text-sm" disabled={saving}>
              {saving ? 'Adding...' : 'Add Category'}
            </button>
            {formError && <span className="text-sm text-[#FF4C6A]">{formError}</span>}
          </div>
        </form>

        {loading && (
          <div className="flex justify-center py-10">
            <div className="h-10 w-10 animate-spin rounded-full border-[3px] border-[rgba(255,107,53,0.2)] border-t-[#FF6B35]" />
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-[#FF4C6A]/30 bg-[#FF4C6A]/10 px-4 py-3 text-sm text-[#FF4C6A]">
            {error}
          </div>
        )}

        {!loading && !error && categories.length === 0 && (
          <div className="rounded-lg border border-dashed border-white/10 px-4 py-8 text-center text-sm text-muted">
            No categories yet. Add your first category above.
          </div>
        )}

        {!loading && !error && categories.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-muted">
                <tr>
                  <th className="pb-3 pr-4 font-medium">Name</th>
                  <th className="pb-3 pr-4 font-medium">Description</th>
                  <th className="pb-3 pr-4 font-medium">Display Order</th>
                  <th className="pb-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {categories.map((category) => (
                  <tr key={category.id} className="align-top">
                    <td className="py-4 pr-4 font-medium text-white">{category.name}</td>
                    <td className="py-4 pr-4 text-muted">
                      {category.description ? category.description : '—'}
                    </td>
                    <td className="py-4 pr-4 text-muted">{category.display_order ?? '—'}</td>
                    <td className="py-4 text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:border-white/30"
                          onClick={() => setEditTarget(category)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="rounded-lg border border-[#FF4C6A]/40 px-3 py-2 text-xs font-semibold text-[#FF4C6A] transition hover:border-[#FF4C6A]"
                          onClick={() => {
                            setDeleteError(null);
                            setDeleteTarget(category);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {editTarget && (
          <EditCategoryModal
            category={editTarget}
            onClose={() => setEditTarget(null)}
            onSuccess={handleEditSuccess}
          />
        )}

        {deleteTarget && (
          <ConfirmDeleteModal
            title="Delete category"
            description={`This will permanently delete "${deleteTarget.name}".`}
            warning="If items are still assigned, deletion will be blocked."
            confirmLabel="Delete category"
            isBusy={deleteBusy}
            error={deleteError}
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleDeleteConfirm}
          />
        )}
      </div>

      {toasts.map((toast) => (
        <ToastNotification
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => dismissToast(toast.id)}
        />
      ))}
    </>
  );
};

export default MenuCategoriesPanel;
