import React from "react";
import PageIndicator from "./PageIndicator";
import "../../styles/pagination.css";
import { Translation } from "../../misc/translations";

export default function Paginator({
  data,
  currentPage,
  numPages,
}: {
  data: Translation;
  currentPage: number;
  numPages: number;
}) {
  const pages: (undefined | number)[] = [1];

  function addPage(page: number) {
    if (pages.includes(page)) return;
    if (page < 1 || page > numPages) return;
    pages.push(page);
  }

  if (currentPage > 4) pages.push(undefined);

  for (let i = -2; i <= 2; i++) {
    addPage(currentPage + i);
  }
  if (currentPage + 2 < numPages - 1) pages.push(undefined);
  addPage(numPages);

  return (
    <div className="paginator">
      {pages.map((page, idx) => (
        <PageIndicator
          data={data}
          key={"page-" + page + "-" + idx}
          page={page}
          currentPage={currentPage}
        />
      ))}
    </div>
  );
}

