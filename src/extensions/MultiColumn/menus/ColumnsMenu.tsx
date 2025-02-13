import { BubbleMenu as BaseBubbleMenu, useEditorState } from "@tiptap/react";
import { useCallback } from "react";
import { sticky } from "tippy.js";
import { v4 as uuid } from "uuid";

import { MenuProps } from "@/components/forms/tiptap/menus/types";
import { getRenderContainer } from "@/lib/utils/getRenderContainer";
import { Toolbar } from "@/components/ui/Toolbar";
import { ColumnLayout } from "../Columns";
import { Icon } from "@/components/ui/Icon";

export const ColumnsMenu = ({ editor, appendTo }: MenuProps) => {
  const getReferenceClientRect = useCallback(() => {
    const renderContainer = getRenderContainer(editor, "columns");
    const rect =
      renderContainer?.getBoundingClientRect() ||
      new DOMRect(-1000, -1000, 0, 0);

    return rect;
  }, [editor]);

  const isColumnEmpty = useCallback(() => {
    const renderContainer = getRenderContainer(editor, "columns");
    if (!renderContainer) return false;
    return renderContainer.classList.contains("is-empty");
  }, [editor]);

  const shouldShow = useCallback(() => {
    // Only show the columns menu if:
    // 1. The editor is currently in column layout.
    // 2. The column layout has no child nodes (it's empty).
    // 3. The selection is not inside an image (prevents the image menu from showing).
    const isColumns = editor.isActive("columns");
    return isColumns && isColumnEmpty();
  }, [editor, isColumnEmpty]);

  const onColumnLeft = useCallback(() => {
    editor.chain().focus().setLayout(ColumnLayout.SidebarLeft).run();
  }, [editor]);

  const onColumnRight = useCallback(() => {
    editor.chain().focus().setLayout(ColumnLayout.SidebarRight).run();
  }, [editor]);

  const onColumnTwo = useCallback(() => {
    editor.chain().focus().setLayout(ColumnLayout.TwoColumn).run();
  }, [editor]);
  const { isColumnLeft, isColumnRight, isColumnTwo } = useEditorState({
    editor,
    selector: (ctx) => {
      return {
        isColumnLeft: ctx.editor.isActive("columns", {
          layout: ColumnLayout.SidebarLeft,
        }),
        isColumnRight: ctx.editor.isActive("columns", {
          layout: ColumnLayout.SidebarRight,
        }),
        isColumnTwo: ctx.editor.isActive("columns", {
          layout: ColumnLayout.TwoColumn,
        }),
      };
    },
  });

  return (
    <BaseBubbleMenu
      editor={editor}
      pluginKey={`columnsMenu-${uuid()}`}
      shouldShow={shouldShow}
      updateDelay={0}
      tippyOptions={{
        offset: [0, 8],
        popperOptions: {
          modifiers: [{ name: "flip", enabled: false }],
        },
        getReferenceClientRect,
        appendTo: () => appendTo?.current,
        plugins: [sticky],
        sticky: "popper",
      }}
    >
      <Toolbar.Wrapper>
        <Toolbar.Button
          tooltip="Sidebar left"
          active={isColumnLeft}
          onClick={onColumnLeft}
        >
          <Icon name="PanelLeft" />
        </Toolbar.Button>
        <Toolbar.Button
          tooltip="Two columns"
          active={isColumnTwo}
          onClick={onColumnTwo}
        >
          <Icon name="Columns2" />
        </Toolbar.Button>
        <Toolbar.Button
          tooltip="Sidebar right"
          active={isColumnRight}
          onClick={onColumnRight}
        >
          <Icon name="PanelRight" />
        </Toolbar.Button>
      </Toolbar.Wrapper>
    </BaseBubbleMenu>
  );
};

export default ColumnsMenu;
