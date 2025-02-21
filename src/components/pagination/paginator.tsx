import { getTranslations } from "@/lib/providers/translation-provider";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/ui/pagination";

export async function Paginator({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const { data } = await getTranslations();
  const pages: (undefined | number)[] = [1];

  function addPage(page: number) {
    if (pages.includes(page)) return;
    if (page < 1 || page > totalPages) return;
    pages.push(page);
  }

  // Optional second page and skipped pages indicator '...'
  if (currentPage > 4) {
    if (currentPage === totalPages) {
      pages.push(2);
      if (currentPage > 5) pages.push(undefined);
    } else {
      pages.push(currentPage === 5 ? 2 : undefined);
    }
  }

  for (let i = -2; i <= 2; i++) {
    addPage(currentPage + i);
  }

  if (currentPage < totalPages - 3) {
    if (currentPage === 1) {
      if (currentPage < totalPages - 5) pages.push(undefined);
      pages.push(totalPages - 1);
    } else {
      pages.push(currentPage === totalPages - 4 ? totalPages - 1 : undefined);
    }
  }

  addPage(totalPages);

  const getHref = (page: number) => `./${page}`;

  return (
    <Pagination>
      <PaginationContent className="my-2 flex-wrap justify-center gap-y-2 sm:flex-nowrap">
        <div className="order-1 flex w-full justify-center gap-1 sm:order-2">
          {pages.map((page, idx) => (
            <PaginationItem key={`page-${page}-${idx}`}>
              {page == null ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  href={getHref(page)}
                  isActive={page === currentPage}
                >
                  {data.numberFormat.format(page)}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
        </div>
        <PaginationItem className="order-2 sm:order-1">
          <PaginationPrevious
            disabled={currentPage === 1}
            href={getHref(currentPage - 1)}
          >
            {data.liveSeries.tvShowList.previous}
          </PaginationPrevious>
        </PaginationItem>
        <PaginationItem className="order-3">
          <PaginationNext
            disabled={currentPage === totalPages}
            href={getHref(currentPage + 1)}
          >
            {data.liveSeries.tvShowList.next}
          </PaginationNext>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
