import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-[calc(100vh-72px)] flex flex-col items-center justify-center text-center px-6">
      <p className="text-7xl font-serif font-bold text-gray-100">404</p>
      <h1 className="text-2xl font-serif font-bold text-gray-900 mt-4">Page not found</h1>
      <p className="text-gray-500 mt-2 max-w-xs">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="mt-6 px-6 py-2.5 rounded-full bg-[#1B1B1B] text-white text-sm font-semibold hover:bg-[#333] transition-colors"
      >
        Go Home
      </Link>
    </div>
  );
}
