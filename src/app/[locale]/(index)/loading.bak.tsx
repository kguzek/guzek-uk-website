import { PageSkeleton } from "@/components/pages/skeleton";

export default function LoadingPage() {
  return (
    <div className="text flex justify-center">
      <div className="prose w-full">
        <PageSkeleton />
      </div>
    </div>
  );
}
