const STATUS_STYLES = {
  draft: 'bg-yellow-900 bg-opacity-50 border-yellow-700 border-opacity-50 text-yellow-400',
  published: 'bg-green-900 bg-opacity-50 border-green-700 border-opacity-50 text-green-400',
  archived: 'bg-gray-800 border-gray-600 text-gray-500',
};

export default function ObituaryList({ obituaries, loading, onEdit, onPreview, onMemories, onDelete, onNew }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (obituaries.length === 0) {
    return (
      <div className="text-center py-20 bg-dark-800 border border-gray-700 border-dashed rounded-xl">
        <svg className="w-12 h-12 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-gray-400 mb-4">No obituaries yet</p>
        <button
          onClick={onNew}
          className="bg-gold-500 hover:bg-gold-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition"
        >
          Create your first obituary
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {obituaries.map((obit) => {
        const createdDate = obit.createdAt?.toDate
          ? obit.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : '—';
        const primaryImage = obit.images?.[0];
        const statusStyle = STATUS_STYLES[obit.status] || STATUS_STYLES.draft;

        return (
          <div
            key={obit.id}
            className="bg-dark-800 border border-gray-700 hover:border-gray-600 rounded-xl p-5 transition group"
          >
            <div className="flex items-start gap-4">
              {/* Thumbnail */}
              <div className="shrink-0">
                {primaryImage ? (
                  <img
                    src={primaryImage}
                    alt={obit.fullName}
                    className="w-14 h-14 rounded-lg object-cover border border-gray-600"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-lg bg-dark-900 border border-gray-700 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-white font-medium text-base truncate">
                    {obit.fullName || 'Unnamed'}
                  </h3>
                  <span className={`text-xs px-2 py-0.5 border rounded-full ${statusStyle}`}>
                    {obit.status ? obit.status.charAt(0).toUpperCase() + obit.status.slice(1) : 'Draft'}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-400 flex-wrap">
                  {obit.birthDate && obit.deathDate && (
                    <span>{obit.birthDate} — {obit.deathDate}</span>
                  )}
                  {obit.location && (
                    <span className="flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {obit.location}
                    </span>
                  )}
                  {obit.images?.length > 0 && (
                    <span className="text-gray-500 text-xs">
                      {obit.images.length} photo{obit.images.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
                {obit.bio && (
                  <p className="text-gray-500 text-sm mt-2 line-clamp-2">{obit.bio}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Memories */}
                <button
                  onClick={() => onMemories(obit)}
                  title="View Memories"
                  className="p-2 text-gray-400 hover:text-purple-400 hover:bg-purple-900 hover:bg-opacity-20 rounded-lg transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
                {/* Preview */}
                <button
                  onClick={() => onPreview(obit)}
                  title="Preview"
                  className="p-2 text-gray-400 hover:text-gold-400 hover:bg-gold-500 hover:bg-opacity-10 rounded-lg transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                {/* Edit */}
                <button
                  onClick={() => onEdit(obit)}
                  title="Edit"
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                {/* Delete */}
                <button
                  onClick={() => onDelete(obit.id)}
                  title="Delete"
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900 hover:bg-opacity-20 rounded-lg transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Footer row */}
            <div className="mt-3 pt-3 border-t border-gray-700 border-opacity-50 flex items-center gap-4 text-xs text-gray-600">
              <span>Added {createdDate}</span>
              {obit.services?.length > 0 && (
                <span>{obit.services.length} service{obit.services.length !== 1 ? 's' : ''}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
