import { memo } from "react";

export type EditorInfoProps = {
  characters: number;
  words: number;
};

export const EditorInfo = memo(({ characters, words }: EditorInfoProps) => {
  return (
    <div className="flex items-center">
      <div className="mr-4 flex flex-col justify-center border-r border-neutral-200 pr-4 text-right dark:border-neutral-800">
        <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
          {words} {words === 1 ? "word" : "words"}
        </div>
        <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
          {characters} {characters === 1 ? "character" : "characters"}
        </div>
      </div>
      <div className="mr-2 flex items-center gap-2">
        <div className="h-2 w-2 rounded-full" />
      </div>
    </div>
  );
});

EditorInfo.displayName = "EditorInfo";
