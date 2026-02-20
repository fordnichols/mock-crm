export default function DealsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-24 rounded-md bg-muted animate-pulse" />
          <div className="h-4 w-16 rounded-md bg-muted animate-pulse" />
        </div>
        <div className="h-9 w-28 rounded-md bg-muted animate-pulse" />
      </div>
      <div className="flex gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex flex-col gap-2 min-w-60 w-60">
            <div className="h-5 w-24 rounded bg-muted animate-pulse" />
            <div className="rounded-xl border bg-muted/40 min-h-32 p-2 space-y-2">
              {[...Array(Math.floor(Math.random() * 3))].map((_, j) => (
                <div key={j} className="h-16 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
