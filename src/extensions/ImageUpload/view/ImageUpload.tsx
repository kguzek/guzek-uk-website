import { useLinkEditorState } from "@/components/forms/tiptap/panels";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Editor, NodeViewWrapper } from "@tiptap/react";
import { useCallback } from "react";

export const ImageUpload = ({
  getPos,
  editor,
  initialUrl = "",
}: {
  getPos: () => number;
  editor: Editor;
  initialUrl?: string;
}) => {
  const onUpload = useCallback(
    (url: string) => {
      if (url) {
        editor
          .chain()
          .setImageBlock({ src: url })
          .deleteRange({ from: getPos(), to: getPos() })
          .focus()
          .run();
      }
    },
    [getPos, editor],
  );

  const state = useLinkEditorState({
    onSetLink: onUpload,
    initialOpenInNewTab: false,
    initialUrl,
  });

  return (
    <NodeViewWrapper>
      <div className="m-0 p-0" data-drag-handle>
        <form onSubmit={state.handleSubmit} className="flex items-center gap-2">
          <label className="flex cursor-text items-center gap-2 rounded-lg bg-neutral-100 p-2 dark:bg-neutral-900">
            <Icon
              name="Link"
              className="flex-none text-black dark:text-white"
            />
            <input
              type="url"
              className="min-w-[12rem] flex-1 bg-transparent text-sm text-black outline-none dark:text-white"
              placeholder="Enter URL"
              value={state.url}
              onChange={state.onChange}
            />
          </label>
          <Button
            variant="primary"
            buttonSize="small"
            type="submit"
            disabled={!state.isValidUrl}
          >
            Set Image Link
          </Button>
        </form>
      </div>
    </NodeViewWrapper>
  );
};

export default ImageUpload;
