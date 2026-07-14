interface LoadMoreButtonProps {
  hasMore?: boolean;
  loading?: boolean;
  label?: string;
  onClick: () => void;
}

export default function LoadMoreButton({
  hasMore,
  loading = false,
  label = 'Load more',
  onClick,
}: LoadMoreButtonProps) {
  if (!hasMore) return null;
  return (
    <div className="mt-8 text-center">
      <button
        disabled={loading}
        onClick={onClick}
        className="rounded-full border border-gray-300 bg-white px-8 py-3 text-sm font-semibold text-gray-700 hover:border-gray-500 hover:text-black disabled:cursor-wait disabled:opacity-50"
      >
        {loading ? 'Loading…' : label}
      </button>
    </div>
  );
}
