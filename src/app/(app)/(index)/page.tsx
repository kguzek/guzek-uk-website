import {
  DynamicPageLoader,
  getPageBySlug,
} from "@/components/pages/dynamic-page";
import { getTitle } from "@/lib/util";

export async function generateMetadata() {
  const homepage = await getPageBySlug("/");
  return {
    title: getTitle(homepage?.title),
  };
}

export default function Index() {
  return <DynamicPageLoader slug="/" />;
}
