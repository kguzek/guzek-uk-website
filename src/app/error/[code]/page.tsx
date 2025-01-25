import { ErrorComponent } from "@/components/error-component";
import { ErrorCode } from "@/lib/enums";
import { getTitle } from "@/lib/util";
import { useTranslations } from "@/providers/translation-provider";

type Props = {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ message?: string }>;
};

async function propsToErrorCode({ params, searchParams }: Props) {
  const { code } = await params;
  const { message } = await searchParams;
  if (!code || isNaN(+code) || !Object.keys(ErrorCode).includes(code))
    return { code: ErrorCode.NotFound, description: undefined };
  return {
    code: +code as ErrorCode,
    message,
  };
}

export async function generateMetadata(props: Props) {
  const { data } = await useTranslations();
  const { code } = await propsToErrorCode(props);
  return {
    title: getTitle(`${code} ${data.error[code].title}`),
  };
}

export default async function ErrorPage(props: Props) {
  const { code, message } = await propsToErrorCode(props);
  return <ErrorComponent errorCode={code} errorMessage={message} />;
}
