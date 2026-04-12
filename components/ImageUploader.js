/**
 * ImageUploader — handles upload of up to `maxImages` images to Firebase Storage.
 * NOTE: You must configure CORS on your Firebase Storage bucket before uploads work
 * from an external domain. Run: gsutil cors set cors.json gs://your-bucket
 */
import { useRef, useState } from 'react';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../lib/firebase';

export default function ImageUploader({ images = [], onChange, maxImages = 5, folder = 'obituaries' }) {
  const inputRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    if (images.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed.`);
      return;
    }
    setError('');
    setUploading(true);
    setProgress(0);

    const newUrls = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const storageRef = ref(storage, `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`);
      await new Promise((resolve, reject) => {
        const task = uploadBytesResumable(storageRef, file);
        task.on(
          'state_changed',
          (snap) => setProgress(Math.round(((i + snap.bytesTransferred / snap.totalBytes) / files.length) * 100)),
          (err) => { setError('Upload failed: ' + err.message); reject(err); },
          async () => {
            const url = await getDownloadURL(task.snapshot.ref);
            newUrls.push(url);
            resolve();
          }
        );
      });
    }

    onChange([...images, ...newUrls]);
    setUploading(false);
    setProgress(0);
    // Reset input so same file can be re-selected
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleRemove = (url) => {
    // Attempt to delete from Storage (non-blocking — may fail if not owned)
    try {
      const storageRef = ref(storage, url);
      deleteObject(storageRef).catch(() => {});
    } catch (_) {}
    onChange(images.filter((u) => u !== url));
  };

  const handleMoveLeft = (idx) => {
    if (idx === 0) return;
    const next = [...images];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    onChange(next);
  };

  return (
    <div>
      {/* Thumbnail Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-3">
          {images.map((url, idx) => (
            <div key={url} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-600">
              <img src={url} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" />
              {/* Badge for primary */}
              {idx === 0 && (
                <span className="absolute top-1 left-1 bg-gold-500 text-white text-xs px-1.5 py-0.5 rounded">
                  Primary
                </span>
              )}
              {/* Controls */}
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1">
                {idx > 0 && (
                  <button
                    type="button"
                    onClick={() => handleMoveLeft(idx)}
                    title="Move left / set as primary"
                    className="w-7 h-7 bg-gold-500 rounded-full text-white text-xs flex items-center justify-center hover:bg-gold-600"
                  >
                    ←
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(url)}
                  title="Remove image"
                  className="w-7 h-7 bg-red-600 rounded-full text-white text-xs flex items-center justify-center hover:bg-red-700"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      {images.length < maxImages && (
        <div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 bg-dark-900 border border-gray-600 border-dashed text-gray-400 hover:text-white hover:border-gray-400 rounded-lg text-sm transition disabled:opacity-50"
          >
            {uploading ? (
              <>
                <div className="w-4 h-4 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
                Uploading… {progress}%
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Add {images.length > 0 ? 'More ' : ''}Photos ({images.length}/{maxImages})
              </>
            )}
          </button>
          {images.length === 0 && (
            <p className="text-gray-600 text-xs mt-1">First image will be used as the primary photo. Hover images to reorder or remove.</p>
          )}
        </div>
      )}

      {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
    </div>
  );
}
