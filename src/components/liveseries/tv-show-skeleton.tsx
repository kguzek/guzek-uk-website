export function TvShowSkeleton() {
  return (
    <div className="details skeleton">
      <h2 className="skeleton-text h-8"></h2>
      <div className="flex flex-wrap">
        <div className="skeleton-text bg-primary h-8 w-1/5"></div>
        <div className="skeleton-text h-8 w-1/3"></div>
      </div>
      <p className="skeleton-text h-6 w-72"></p>
      <p className="skeleton-text h-[50vh] w-full"></p>
    </div>
  );
}
