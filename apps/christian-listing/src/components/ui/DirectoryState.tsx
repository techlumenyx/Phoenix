interface DirectoryStateProps {
  kind: 'loading' | 'error' | 'empty';
  title?: string;
  detail?: string;
  onRetry?: () => void;
}

export default function DirectoryState({ kind, title, detail, onRetry }: DirectoryStateProps) {
  if (kind === 'loading')
    return (
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-label="Loading results">
        <div className="h-80 animate-pulse rounded-2xl bg-gray-100" />
        <div className="h-80 animate-pulse rounded-2xl bg-gray-100" />
        <div className="h-80 animate-pulse rounded-2xl bg-gray-100" />
      </div>
    );
  return (
    <div
      role={kind === 'error' ? 'alert' : 'status'}
      className={`rounded-2xl border border-dashed px-6 py-14 text-center ${kind === 'error' ? 'border-red-200 bg-red-50' : 'border-gray-300 bg-gray-50'}`}
    >
      <h3 className="font-serif text-xl font-bold text-gray-900">
        {title ?? (kind === 'error' ? 'Something went wrong' : 'No results found')}
      </h3>
      {detail && <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">{detail}</p>}
      {kind === 'error' && onRetry && (
        <button
          onClick={onRetry}
          className="mt-5 rounded-full bg-[#1B1B1B] px-5 py-2.5 text-sm font-semibold text-white"
        >
          Try again
        </button>
      )}
    </div>
  );
}
