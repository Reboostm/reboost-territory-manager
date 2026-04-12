import { useState } from 'react';
import ImageUploader from './ImageUploader';
import { addMemory } from '../lib/memories';

const RELATIONSHIPS = ['Family', 'Friend', 'Colleague', 'Neighbor', 'Other'];

export default function MemoryForm({ obituaryId, onMemoryAdded, onCancel }) {
  const [form, setForm] = useState({
    name: '',
    relationship: 'Friend',
    memoryText: '',
    photos: [],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.memoryText.trim()) {
      setError('Name and memory text are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await addMemory({
        obituaryId,
        name: form.name,
        relationship: form.relationship,
        memoryText: form.memoryText,
        photos: form.photos,
      });
      setSuccess(true);
      setTimeout(() => {
        setForm({ name: '', relationship: 'Friend', memoryText: '', photos: [] });
        setSuccess(false);
        onMemoryAdded?.();
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(`Failed to save memory: ${err.message || err}`);
    } finally {
      setSaving(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-900 bg-opacity-30 border border-green-700 rounded-xl p-6 text-center">
        <p className="text-green-400 font-medium">✓ Memory added successfully!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-dark-800 border border-gray-700 rounded-xl p-6 mb-6">
      <h3 className="text-white font-medium text-lg mb-4">Add a Memory</h3>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Your Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Jane Smith"
            className="w-full bg-dark-900 border border-gray-600 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 placeholder-gray-600"
          />
        </div>

        {/* Relationship */}
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Relationship</label>
          <select
            value={form.relationship}
            onChange={(e) => setForm({ ...form, relationship: e.target.value })}
            className="w-full bg-dark-900 border border-gray-600 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500"
          >
            {RELATIONSHIPS.map((rel) => (
              <option key={rel} value={rel}>
                {rel}
              </option>
            ))}
          </select>
        </div>

        {/* Memory Text */}
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Your Memory *</label>
          <textarea
            value={form.memoryText}
            onChange={(e) => setForm({ ...form, memoryText: e.target.value })}
            placeholder="Share a cherished memory, story, or message…"
            rows={5}
            className="w-full bg-dark-900 border border-gray-600 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500 placeholder-gray-600 resize-y"
          />
        </div>

        {/* Photos */}
        <div>
          <label className="block text-sm text-gray-400 mb-1.5">Photos (Optional)</label>
          <p className="text-gray-500 text-xs mb-3">
            Add up to 5 photos to accompany this memory. They'll appear in a rotating carousel.
          </p>
          <ImageUploader
            images={form.photos}
            onChange={(urls) => setForm({ ...form, photos: urls })}
            maxImages={5}
            folder="memories"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900 bg-opacity-20 border border-red-800 rounded-lg px-4 py-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 px-4 py-2.5 bg-gold-500 hover:bg-gold-600 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition"
          >
            {saving ? 'Saving…' : 'Share Memory'}
          </button>
        </div>
      </div>
    </form>
  );
}
