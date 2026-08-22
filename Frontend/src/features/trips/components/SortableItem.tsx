import type { ReactNode } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/cn';

export function SortableItem({
  id,
  children,
  className,
}: {
  id: string;
  children: (dragHandleProps: { listeners: ReturnType<typeof useSortable>['listeners']; attributes: ReturnType<typeof useSortable>['attributes'] }) => ReactNode;
  className?: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(isDragging && 'z-10 opacity-70', className)}
    >
      {children({ listeners, attributes })}
    </div>
  );
}
