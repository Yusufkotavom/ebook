export default function OfflinePage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 text-center">
      <div>
        <h1 className="text-2xl font-semibold">You are offline</h1>
        <p className="mt-2 text-muted-foreground">
          Please check your internet connection. Some content may be unavailable.
        </p>
      </div>
    </div>
  )
}

