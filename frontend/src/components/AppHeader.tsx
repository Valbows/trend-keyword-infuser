import Link from 'next/link';

const AppHeader: React.FC = () => {
  return (
    <header className="mb-8 text-center">
      <h1 className="text-4xl sm:text-5xl font-bold text-sky-600 dark:text-sky-400">
        Trend Keyword Infuser
      </h1>
      <p className="text-slate-600 dark:text-slate-300 mt-2 text-lg">
        Generate video scripts powered by the latest trends!
      </p>
      <div className="mt-6">
        <Link href="/scripts"
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 transition-all duration-150 ease-in-out text-lg transform hover:scale-105 active:scale-95">
          Manage AI Scripts
        </Link>
      </div>
    </header>
  );
};

export default AppHeader;
