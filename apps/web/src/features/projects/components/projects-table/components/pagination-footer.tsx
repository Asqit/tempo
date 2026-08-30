import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@tempo/ui/components/pagination";

type PaginationFooterProps = {
  page: number;
  totalPages: number;
  isFetching: boolean;
  isLoading: boolean;
  canGoPrevious: boolean;
  canGoNext: boolean;
  pageNumbers: number[];
  onPageChange: (page: number) => void;
};

export function PaginationFooter({
  page,
  totalPages,
  isFetching,
  isLoading,
  canGoPrevious,
  canGoNext,
  pageNumbers,
  onPageChange,
}: PaginationFooterProps) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
      <span>
        Strana {page} z {totalPages}
        {isFetching && !isLoading ? " • aktualizuji..." : ""}
      </span>

      <Pagination className="mx-0 w-auto justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              text="Předchozí"
              href="#"
              aria-disabled={!canGoPrevious}
              className={
                !canGoPrevious ? "pointer-events-none opacity-50" : undefined
              }
              onClick={(event) => {
                event.preventDefault();
                if (canGoPrevious) {
                  onPageChange(page - 1);
                }
              }}
            />
          </PaginationItem>

          {pageNumbers.map((pageNumber) => (
            <PaginationItem key={pageNumber}>
              <PaginationLink
                href="#"
                isActive={pageNumber === page}
                onClick={(event) => {
                  event.preventDefault();
                  onPageChange(pageNumber);
                }}
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              text="Další"
              href="#"
              aria-disabled={!canGoNext}
              className={
                !canGoNext ? "pointer-events-none opacity-50" : undefined
              }
              onClick={(event) => {
                event.preventDefault();
                if (canGoNext) {
                  onPageChange(page + 1);
                }
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
