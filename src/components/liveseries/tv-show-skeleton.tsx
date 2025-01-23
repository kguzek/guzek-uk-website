export function TvShowSkeleton() {
  return (
    <div className="details skeleton">
      <h2 className="skeleton-text" style={{ height: 32 }}></h2>
      <div className="flex flex-wrap">
        <div
          className="skeleton-text"
          style={{
            height: 30,
            width: "20%",
            backgroundColor: "var(--color-primary)",
          }}
        ></div>
        <div
          className="skeleton-text"
          style={{ height: 30, width: "30%" }}
        ></div>
      </div>
      <p className="skeleton-text" style={{ height: 25, width: 300 }}></p>
      <p
        className="skeleton-text"
        style={{ height: "50vh", width: "100%" }}
      ></p>
    </div>
  );
}
