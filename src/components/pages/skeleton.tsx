export function PageSkeleton() {
  return (
    <div className="skeleton mt-5 flex flex-col gap-4">
      <div className="skeleton-text h-[45px]!"></div>
      <div>
        <br />
      </div>
      <div className="skeleton-text h-[34px]! w-1/3 min-w-32"></div>
      <div className="skeleton-text h-[26px]! w-2/3 min-w-40"></div>
      <div className="skeleton-text w-1/2 min-w-36"></div>
      <div className="skeleton-text h-[50vh]! w-full"></div>
    </div>
  );
}
