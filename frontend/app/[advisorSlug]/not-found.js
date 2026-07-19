export default function AdvisorNotFound() {
  return (
    <main className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="text-sm font-medium text-primary-600">404</p>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">
          This advisor page could not be found.
        </h1>
        <p className="mt-3 text-gray-500">
          Double-check the link, or ask your advisor for their correct page address.
        </p>
      </div>
    </main>
  );
}
