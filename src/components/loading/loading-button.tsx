import { ThreeDots } from "react-loader-spinner";
import { COLOR_PRIMARY } from ".";

export function LoadingButton() {
  return (
    <div className="flex-column">
      <ThreeDots color={COLOR_PRIMARY} />
    </div>
  );
}
