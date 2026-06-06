import React, { useState } from 'react';
import api from '../../../api/axios';
import { getApiErrorMessage } from '../../../api/errors';
import {
  deleteMenuImage,
  extractFileNameFromUrl,
  uploadMenuImage,
} from '../../../api/imageUpload';
import type { MenuCategory } from '../../../hooks/useMenuCategories';
import type { MenuItem } from '../../../hooks/useMenuItems';
import ImageUploadInput from '../../ImageUploadInput';

interface EditMenuItemModalProps {
  item: MenuItem;
  categories: MenuCategory[];
  onClose: () => void;
  onSuccess: () => void;
}

const EditMenuItemModal: React.FC<EditMenuItemModalProps> = ({
  item,
  categories,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState(item.name);
  const [description, setDescription] = useState(item.description ?? '');
  const [price, setPrice] = useState(String(item.price));
  const [categoryId, setCategoryId] = useState(item.category_id);
  const [imageUrl, setImageUrl] = useState<string>(item.image_url ?? '');
  const [isAvailable, setIsAvailable] = useState(item.is_available);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);

  const handleImageUpload = async (file: File): Promise<string> => {
    const result = await uploadMenuImage(file);
    return result.publicUrl;
  };

  const handleImageChange = async (newUrl: string) => {
    const previousUrl = item.image_url;

    // If there was an existing image and it's being replaced with something different,
    // try to remove the old file from storage (best-effort, non-blocking)
    if (previousUrl && previousUrl !== newUrl && newUrl !== '') {
      const oldFileName = extractFileNameFromUrl(previousUrl);
      if (oldFileName) {
        deleteMenuImage(oldFileName).catch(() => {
          // Silently ignore deletion failures — the URL is already being replaced
        });
      }
    }

    setImageUrl(newUrl);
    setImageUploadError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Item name is required.');
      return;
    }

    const parsedPrice = Number(price);
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      setError('Price must be a positive number.');
      return;
    }

    if (!categoryId) {
      setError('Please select a category.');
      return;
    }

    setSaving(true);

    try {
      await api.put(`/api/menu/items/${item.id}`, {
        name: name.trim(),
        description: description.trim().length > 0 ? description.trim() : null,
        price: parsedPrice,
        category_id: categoryId,
        image_url: imageUrl.trim().length > 0 ? imageUrl.trim() : null,
        is_available: isAvailable,
      });
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, 'Failed to update the menu item.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
      <div className="glass-card w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="mb-5">
          <h3 className="text-xl font-semibold">Edit Menu Item</h3>
          <p className="text-muted mt-2 text-sm">Update the menu item details and availability.</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-[#FF4C6A]/30 bg-[#FF4C6A]/10 px-4 py-3 text-sm text-[#FF4C6A]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/70">Name</label>
            <input
              className="input-field"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Item name"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/70">Description</label>
            <textarea
              className="input-field min-h-24 resize-none"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Optional description"
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/70">Price (LKR)</label>
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
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-white/70">Category</label>
            <select
              className="input-field"
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              required
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <ImageUploadInput
              label="Image"
              value={imageUrl || null}
              onChange={handleImageChange}
              onError={(err) => setImageUploadError(err)}
              onUpload={handleImageUpload}
              disabled={saving}
              showPreview={true}
            />
            {imageUploadError && (
              <p className="mt-1 text-xs text-[#FF4C6A]">{imageUploadError}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              id="edit-item-available"
              type="checkbox"
              checked={isAvailable}
              onChange={(event) => setIsAvailable(event.target.checked)}
              className="h-4 w-4 accent-[#FF6B35]"
            />
            <label htmlFor="edit-item-available" className="text-sm">
              Available to customers
            </label>
          </div>
          <div className="md:col-span-2 flex flex-wrap gap-3 pt-2">
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

export default EditMenuItemModal;
