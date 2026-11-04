import { PageSkeleton } from "@/components/dashboard/page-skeleton";

export default function Loading() {
  return <PageSkeleton stats={4} rows={4} variant="grid" />;
}
