import { ErrorComponent } from "@/components/error/component";
import { ErrorCode } from "@/lib/enums";
import { getTranslations } from "@/lib/providers/translation-provider";
import { isNumber } from "@/lib/util";

type Props = {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ message?: string }>;
};

const isErrorCode = (code: number): code is ErrorCode => code in ErrorCode;

async function propsToErrorCode({ params, searchParams }: Props) {
  const { code: codeString } = await params;
  const { message } = await searchParams;
  const code = +codeString;
  if (!isNumber(codeString) || !isErrorCode(code))
    return { code: ErrorCode.NotFound, message: undefined };
  return { code, message };
}

export async function generateMetadata(props: Props) {
  const { data } = await getTranslations();
  const { code } = await propsToErrorCode(props);
  return {
    title: `${code} ${data.error[code].title}`,
  };
}

export default async function ErrorPage(props: Props) {
  const { code, message } = await propsToErrorCode(props);
  return <ErrorComponent errorCode={code} errorMessage={message} />;
}
