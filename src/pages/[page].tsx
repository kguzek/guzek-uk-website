import ErrorPage from "@/components/error-page";
import { useFetch } from "@/context/fetch-context";
import { ErrorCode } from "@/lib/models";
import { useRouter } from "next/router";
import PageTemplate, { PageSkeleton } from "./page-template";

export default function Page() {
  const router = useRouter();
  const { menuItems } = useFetch();

  if (menuItems == null) {
    return (
      <div className="text">
        <PageSkeleton />
      </div>
    );
  }

  const currentPage = menuItems.find(
    (item) => item.shouldFetch && item.url === router.asPath
  );
  console.log({ ...router });

  if (!currentPage) return <ErrorPage errorCode={ErrorCode.NotFound} />;
  return <PageTemplate pageData={currentPage} />;
}
