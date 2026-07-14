export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-64 rounded-lg skeleton" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-2xl skeleton" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="h-72 rounded-2xl skeleton xl:col-span-2" />
        <div className="h-72 rounded-2xl skeleton" />
      </div>
    </div>
  );
}
