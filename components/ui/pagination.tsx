import { Button } from "@/components/ui/button";

export function Pagination({ page, pageCount, onNext, onPrev }: any) {
  return (
    <div className="flex items-center justify-end gap-2 py-4">
      <Button variant="outline" size="sm" onClick={onPrev} disabled={page <= 1}>
        Previous
      </Button>

      <Button variant="outline" size="sm" onClick={onNext} disabled={page >= pageCount}>
        Next
      </Button>
    </div>
  );
}
