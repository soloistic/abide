import { FRUIT_LABELS, type FruitValue } from "@/lib/fruits";

export function FruitTags({ fruits }: { fruits: FruitValue[] }) {
  return (
    <ul className="fruit-tags" aria-label="Fruit of the Spirit">
      {fruits.map((fruit) => (
        <li key={fruit}>{FRUIT_LABELS[fruit]}</li>
      ))}
    </ul>
  );
}
