export function DashboardSkeleton() {
  return (
    <div className="flex h-screen overflow-hidden flex-col bg-[#f8f6f1] lg:flex-row">
      <div className="w-64 border-r border-[#e8dfcf] bg-white hidden lg:block" />

      <main className="flex-1 overflow-y-auto pt-16 lg:pt-0 h-full">
        {/* Header Skeleton */}
        <div className="bg-white border-b border-[#e8dfcf] px-6 py-8 lg:px-10 lg:py-12">
          <div className="space-y-4 animate-pulse">
            <div className="h-12 bg-[#e8dfcf] rounded-lg w-1/3" />
            <div className="h-4 bg-[#e8dfcf] rounded w-1/4" />
          </div>
        </div>

        {/* Stats Cards Skeleton */}
        <div className="p-6 lg:p-10 space-y-10">
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white border border-[#c9b896] rounded-xl p-6 shadow-sm animate-pulse"
              >
                <div className="space-y-3">
                  <div className="h-4 bg-[#e8dfcf] rounded w-2/3" />
                  <div className="h-8 bg-[#e8dfcf] rounded w-1/2" />
                  <div className="h-3 bg-[#e8dfcf] rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>

          {/* Table Skeleton */}
          <div className="bg-white border border-[#c9b896] rounded-xl p-6 shadow-sm">
            <div className="space-y-4 animate-pulse">
              <div className="h-6 bg-[#e8dfcf] rounded w-1/4 mb-6" />
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-[#e8dfcf] rounded" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
