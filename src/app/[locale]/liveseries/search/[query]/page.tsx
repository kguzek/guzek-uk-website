import { redirect } from "next/navigation";

export default async function LiveSeriesSearchPage({
  params,
}: {
  params: Promise<{ query: string }>;
}) {
  const { query } = await params;
  return redirect(`./${query}/1`);
}
