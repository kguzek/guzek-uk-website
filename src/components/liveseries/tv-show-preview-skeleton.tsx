export function TvShowPreviewSkeleton({ idx }: { idx: number }) {
  return (
    <div
      className="preview skeleton"
      style={{ animationDelay: `${(3 * idx) / 4}s` }}
    >
      <div className="preview-header mb-5 justify-between text-base">
        <div className="skeleton-text"></div>
      </div>
      <div className="thumbnail"></div>
    </div>
  );
}
