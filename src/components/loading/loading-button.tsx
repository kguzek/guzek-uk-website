import { ThreeDots } from "react-loader-spinner";

export const COLOR_PRIMARY = "var(--color-primary)";

export function LoadingButton() {
  return (
    <div className="flex-column">
      <ThreeDots color={COLOR_PRIMARY} />
    </div>
  );
}
