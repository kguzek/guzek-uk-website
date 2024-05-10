import React from "react";
import PageIndicator from "./PageIndicator";
import "./Pagination.css";

export default function Paginator({
  currentPage,
  numPages,
}: {
  currentPage: number;
  numPages: number;
}) {
  const pages: (undefined | number)[] = [1];

  function addPage(page: number) {
    if (pages.includes(page)) return;
    if (page < 1 || page > numPages) return;
    pages.push(page);
  }

  // Optional second page and skipped pages indicator '...'
  if (currentPage > 4) {
    if (currentPage === numPages) {
      pages.push(2);
      currentPage > 5 && pages.push(undefined);
    } else {
      pages.push(currentPage === 5 ? 2 : undefined);
    }
  }

  for (let i = -2; i <= 2; i++) {
    addPage(currentPage + i);
  }

  if (currentPage < numPages - 3) {
    if (currentPage === 1) {
      currentPage < numPages - 5 && pages.push(undefined);
      pages.push(numPages - 1);
    } else {
      pages.push(currentPage === numPages - 4 ? numPages - 1 : undefined);
    }
  }

  addPage(numPages);

  return (
    <div className="paginator">
      <PageIndicator
        currentPage={currentPage}
        direction="PREVIOUS"
        disabled={currentPage === 1}
      />
      {pages.map((page, idx) => (
        <PageIndicator
          key={"page-" + page + "-" + idx}
          page={page}
          currentPage={currentPage}
        />
      ))}
      <PageIndicator
        currentPage={currentPage}
        direction="NEXT"
        disabled={currentPage === numPages}
      />
    </div>
  );
}

