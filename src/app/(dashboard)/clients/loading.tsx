export default function ClientsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-32 rounded-md bg-muted animate-pulse" />
          <div className="h-4 w-20 rounded-md bg-muted animate-pulse" />
        </div>
        <div className="h-9 w-32 rounded-md bg-muted animate-pulse" />
      </div>
      <div className="rounded-md border bg-card">
        <div className="p-4 space-y-3">
          <div className="h-4 w-full rounded bg-muted animate-pulse" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 w-full rounded bg-muted/60 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
