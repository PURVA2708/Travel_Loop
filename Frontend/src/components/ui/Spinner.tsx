export function Spinner({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <div className={`animate-spin rounded-full border-2 border-ink/15 border-t-brand ${className}`} />
  );
}

export function PageSpinner() {
  return (
    <div className="flex h-64 items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  );
}
