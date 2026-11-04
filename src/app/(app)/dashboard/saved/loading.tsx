import { PageSkeleton } from "@/components/dashboard/page-skeleton";

export default function Loading() {
  return <PageSkeleton stats={0} rows={6} variant="grid" />;
}
