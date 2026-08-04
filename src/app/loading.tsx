import LoadingSkeleton from '@/components/ui/LoadingSkeleton';

export default function Loading() {
  return (
    <div style={{ padding: 24 }}>
      <LoadingSkeleton rows={10} cols={6} type="table" />
    </div>
  );
}
