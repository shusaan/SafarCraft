import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted-foreground/10", className)}
      {...props}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-1.5 flex-1">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-2 w-16" />
        </div>
      </div>
      <Skeleton className="h-2 w-full" />
      <Skeleton className="h-2 w-3/4" />
      <Skeleton className="h-2 w-5/6" />
    </div>
  );
}

export function SkeletonScoreCard() {
  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-center">
        <Skeleton className="h-24 w-24 rounded-full" />
      </div>
      <div className="space-y-2 text-center">
        <Skeleton className="h-4 w-20 mx-auto" />
        <Skeleton className="h-3 w-40 mx-auto" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-4/5" />
      </div>
    </div>
  );
}

export function SkeletonKeywordList() {
  return (
    <div className="space-y-2 p-6">
      <Skeleton className="h-4 w-28 mb-4" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-2.5 w-2.5 rounded-full" />
          <Skeleton className="h-3 flex-1" />
          <Skeleton className="h-2.5 w-12" />
        </div>
      ))}
    </div>
  );
}
