import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import api from '../../../api/axios';
import { getApiErrorMessage } from '../../../api/errors';
import { uploadMenuImage } from '../../../api/imageUpload';
import { useMenuCategories } from '../../../hooks/useMenuCategories';
import { useMenuItems, type MenuItem } from '../../../hooks/useMenuItems';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import EditMenuItemModal from './EditMenuItemModal';
import ImageUploadInput from '../../ImageUploadInput';
import ToastNotification from '../../ToastNotification';

const formatPrice = (price: number) => {
  if (!Number.isFinite(price)) {
    return 'LKR —';
  }
  return `LKR ${price.toFixed(2)}`;
};

// ── Availability toggle switch ───────────────────────────────────────────────

interface ToggleSwitchProps {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, disabled = false }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={onChange}
    disabled={disabled}
    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 ${
      checked ? 'bg-[#00C9A7]' : 'bg-white/20'
    }`}
  >
    <span
      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
        checked ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

// ── Toast helper ─────────────────────────────────────────────────────────────

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error';
}

let toastCounter = 0;

// ── Main component ────────────────────────────────────────────────────────────

const MenuItemsPanel: React.FC = () => {
  // ── Filters ─────────────────────────────────────────────────────────────
  const [filterCategoryId, setFilterCategoryId] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [filterAvailability, setFilterAvailability] = useState<'all' | 'available' | 'unavailable'>('all');

  const itemFilters = useMemo(() => {
    const includeUnavailable = filterAvailability !== 'available';
    return {
      categoryId: filterCategoryId || undefined,
      search: filterSearch || undefined,
      includeUnavailable,
    };
  }, [filterCategoryId, filterSearch, filterAvailability]);

  // ── Data ─────────────────────────────────────────────────────────────────
  const { categories, loading: categoriesLoading, error: categoriesError, refetch: refetchCategories } = useMenuCategories();
  const { items: allItems, loading, error, refetch } = useMenuItems(itemFilters);

  // When availability filter is 'unavailable', filter client-side since the
  // hook fetches both when includeUnavailable=true (needed to show all)
  const items = useMemo(() => {
    if (filterAvailability === 'unavailable') {
      return allItems.filter((item) => !item.is_available);
    }
    return allItems;
  }, [allItems, filterAvailability]);

  // ── Form state ────────────────────────────────────────────────────────────
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // ── Action state ─────────────────────────────────────────────────────────
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyItemId, setBusyItemId] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<MenuItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // ── Toasts ────────────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState<Toast[]>([]);

  const pushToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = ++toastCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const dismissToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // ── Category map ─────────────────────────────────────────────────────────
  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories]
  );

  // ── Handlers ─────────────────────────────────────────────────────────────

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setCategoryId('');
    setImageUrl('');
    setIsAvailable(true);
    setImageUploadError(null);
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    const result = await uploadMenuImage(file);
    return result.publicUrl;
  };

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Item name is required.');
      return;
    }

    const parsedPrice = Number(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setFormError('Price must be a positive number.');
      return;
    }

    if (!categoryId) {
      setFormError('Please select a category.');
      return;
    }

    setSaving(true);
    try {
      await api.post('/api/menu/items', {
        name: name.trim(),
        description: description.trim().length > 0 ? description.trim() : null,
        price: parsedPrice,
        category_id: categoryId,
        image_url: imageUrl.trim().length > 0 ? imageUrl.trim() : null,
        is_available: isAvailable,
      });
      resetForm();
      await refetch();
      pushToast(`"${name.trim()}" added to the menu.`);
    } catch (err: unknown) {
      setFormError(getApiErrorMessage(err, 'Failed to create the menu item.'));
    } finally {
      setSaving(false);
    }
  };

  const handleAvailabilityToggle = async (item: MenuItem) => {
    setActionError(null);
    setBusyItemId(item.id);

    try {
      await api.patch(`/api/menu/items/${item.id}/availability`, {
        is_available: !item.is_available,
      });
      await refetch();
      pushToast(
        `"${item.name}" is now ${!item.is_available ? 'available' : 'unavailable'}.`,
        'success'
      );
    } catch (err: unknown) {
      setActionError(getApiErrorMessage(err, 'Failed to update availability.'));
    } finally {
      setBusyItemId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    setDeleteBusy(true);
    setDeleteError(null);

    try {
      const deletedName = deleteTarget.name;
      await api.delete(`/api/menu/items/${deleteTarget.id}`);
      setDeleteTarget(null);
      await refetch();
      pushToast(`"${deletedName}" has been deleted.`);
    } catch (err: unknown) {
      setDeleteError(getApiErrorMessage(err, 'Failed to delete the menu item.'));
    } finally {
      setDeleteBusy(false);
    }
  };

  const handleEditSuccess = async () => {
    await refetch();
    pushToast('Menu item updated successfully.');
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="space-y-6">
        <div className="border-b border-white/5 pb-4">
          <h3 className="text-base font-semibold text-white">Items</h3>
        </div>

        {/* ── Create form ── */}
        <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/70">Name *</label>
            <input
              className="input-field"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Grilled Chicken"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/70">Category *</label>
            <select
              className="input-field"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              disabled={categoriesLoading}
              required
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {categoriesError && (
              <button
                type="button"
                onClick={refetchCategories}
                className="mt-2 text-xs text-[#FF6B35]"
              >
                Retry loading categories
              </button>
            )}
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/70">Price (LKR) *</label>
            <input
              className="input-field"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              type="number"
              step="0.01"
              min="0"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/70">Description</label>
            <input
              className="input-field"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Optional"
            />
          </div>
          <div>
            <ImageUploadInput
              label="Image"
              value={imageUrl || null}
              onChange={(url) => { setImageUrl(url); setImageUploadError(null); }}
              onError={(err) => setImageUploadError(err)}
              onUpload={handleImageUpload}
              disabled={saving}
              showPreview={true}
            />
            {imageUploadError && (
              <p className="mt-1 text-xs text-[#FF4C6A]">{imageUploadError}</p>
            )}
          </div>
          <div className="md:col-span-3 flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isAvailable}
                onChange={(event) => setIsAvailable(event.target.checked)}
                className="h-4 w-4 accent-[#FF6B35]"
              />
              Available to customers
            </label>
            <button type="submit" className="btn-primary px-5 py-2 text-sm" disabled={saving}>
              {saving ? 'Adding...' : 'Add Item'}
            </button>
            {formError && <span className="text-sm text-[#FF4C6A]">{formError}</span>}
          </div>
        </form>

        {/* ── Filters ── */}
        <div className="grid gap-3 md:grid-cols-3 pt-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              className="input-field pl-9"
              value={filterSearch}
              onChange={(event) => setFilterSearch(event.target.value)}
              placeholder="Search items…"
            />
          </div>
          <select
            className="input-field"
            value={filterCategoryId}
            onChange={(event) => setFilterCategoryId(event.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            className="input-field"
            value={filterAvailability}
            onChange={(event) =>
              setFilterAvailability(event.target.value as 'all' | 'available' | 'unavailable')
            }
          >
            <option value="all">All availability</option>
            <option value="available">Available only</option>
            <option value="unavailable">Unavailable only</option>
          </select>
        </div>

        {/* ── States ── */}
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

        {actionError && (
          <div className="rounded-lg border border-[#FF4C6A]/30 bg-[#FF4C6A]/10 px-4 py-3 text-sm text-[#FF4C6A]">
            {actionError}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="rounded-lg border border-dashed border-white/10 px-4 py-8 text-center text-sm text-muted">
            {filterSearch || filterCategoryId || filterAvailability !== 'all'
              ? 'No items match the current filters.'
              : 'No menu items yet. Add your first item above.'}
          </div>
        )}

        {/* ── Items table ── */}
        {!loading && !error && items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-muted">
                <tr>
                  <th className="pb-3 pr-4 font-medium">Item</th>
                  <th className="pb-3 pr-4 font-medium">Category</th>
                  <th className="pb-3 pr-4 font-medium">Price</th>
                  <th className="pb-3 pr-4 font-medium">Availability</th>
                  <th className="pb-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {items.map((item) => (
                  <tr key={item.id} className={item.is_available ? '' : 'opacity-60'}>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/5 text-xs text-muted">
                            No img
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-white">{item.name}</div>
                          {item.description && (
                            <div className="text-muted mt-1 max-w-[200px] truncate text-xs">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-muted">
                      {categoryMap.get(item.category_id) ?? 'Unassigned'}
                    </td>
                    <td className="py-4 pr-4 font-medium text-white">
                      {formatPrice(item.price)}
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <ToggleSwitch
                          checked={item.is_available}
                          onChange={() => handleAvailabilityToggle(item)}
                          disabled={busyItemId === item.id}
                        />
                        <span
                          className={`text-xs font-semibold ${
                            item.is_available ? 'text-[#00C9A7]' : 'text-white/50'
                          }`}
                        >
                          {busyItemId === item.id
                            ? '…'
                            : item.is_available
                            ? 'Available'
                            : 'Unavailable'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          className="rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:border-white/30"
                          onClick={() => setEditTarget(item)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="rounded-lg border border-[#FF4C6A]/40 px-3 py-2 text-xs font-semibold text-[#FF4C6A] transition hover:border-[#FF4C6A]"
                          onClick={() => {
                            setDeleteError(null);
                            setDeleteTarget(item);
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

        {/* ── Modals ── */}
        {editTarget && (
          <EditMenuItemModal
            item={editTarget}
            categories={categories}
            onClose={() => setEditTarget(null)}
            onSuccess={handleEditSuccess}
          />
        )}

        {deleteTarget && (
          <ConfirmDeleteModal
            title="Delete menu item"
            description={`This will permanently delete "${deleteTarget.name}".`}
            confirmLabel="Delete item"
            isBusy={deleteBusy}
            error={deleteError}
            onClose={() => setDeleteTarget(null)}
            onConfirm={handleDeleteConfirm}
          />
        )}
      </div>

      {/* ── Toasts (rendered outside scroll container) ── */}
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

export default MenuItemsPanel;
