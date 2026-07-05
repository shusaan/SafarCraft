import { useCallback } from "react";
import { generateId } from "@/lib/utils";

export function useArrayField<T extends { id: string }>(
  items: T[],
  onChange: (items: T[]) => void,
  createItem: () => Omit<T, "id">,
) {
  const add = useCallback(() => {
    const newItem = { ...createItem(), id: generateId() } as T;
    onChange([...items, newItem]);
  }, [items, onChange, createItem]);

  const remove = useCallback(
    (id: string) => {
      onChange(items.filter((item) => item.id !== id));
    },
    [items, onChange],
  );

  const update = useCallback(
    (id: string, partial: Partial<T>) => {
      onChange(items.map((item) => (item.id === id ? { ...item, ...partial } : item)));
    },
    [items, onChange],
  );

  const move = useCallback(
    (fromIndex: number, toIndex: number) => {
      const copy = [...items];
      const [moved] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, moved as T);
      onChange(copy);
    },
    [items, onChange],
  );

  return { add, remove, update, move };
}
