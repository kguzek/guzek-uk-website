import React from "react";
import PageIndicator from "./PageIndicator";
import "../../styles/pagination.css";

export default function Paginator({
  currentPage,
  numPages,
}: {
  currentPage: number;
  numPages: number;
}) {
  const pages: (string | number)[] = [1];

  function addPage(page: number) {
    if (pages.includes(page)) return;
    if (page < 1 || page > numPages) return;
    pages.push(page);
  }

  if (currentPage > 4) pages.push("...");

  for (let i = -2; i <= 2; i++) {
    addPage(currentPage + i);
  }
  if (currentPage + 2 < numPages - 1) pages.push("...");
  addPage(numPages);

  return (
    <div className="paginator">
      {pages.map((page, idx) => (
        <PageIndicator
          key={"page-" + page + "-" + idx}
          page={page}
          currentPage={currentPage}
        />
      ))}
    </div>
  );
}

