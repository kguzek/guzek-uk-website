// TODO: reorganise the styles
import "@/app/liveseries/liveseries.css";

export function PageSkeleton() {
  return (
    <div className="skeleton">
      <h1 className="skeleton-text" style={{ height: 45 }}></h1>
      <br />
      <h2
        className="skeleton-text"
        style={{ height: 34, width: "20%", minWidth: "8em" }}
      ></h2>
      <p
        className="skeleton-text"
        style={{ height: 26, width: "50%", minWidth: "16em" }}
      ></p>
      <p
        className="skeleton-text"
        style={{ width: "45%", minWidth: "14em" }}
      ></p>
      <p
        className="skeleton-text"
        style={{ height: "50vh", width: "100%" }}
      ></p>
    </div>
  );
}
