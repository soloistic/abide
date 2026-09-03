import Link from "next/link";
import { deleteReflection } from "@/app/actions";
import { DELETE_CONFIRM_VALUE } from "@/lib/delete-confirmation";

export function DeleteReflectionForm({ id }: { id: string }) {
  const action = deleteReflection.bind(null, id);

  return (
    <form action={action}>
      <input type="hidden" name="confirm" value={DELETE_CONFIRM_VALUE} />
      <div className="reflection-actions">
        <button className="button button-danger" type="submit">
          Yes, delete this reflection
        </button>
        <Link
          className="button button-secondary"
          href={`/reflections/${id}`}
        >
          Keep this reflection
        </Link>
      </div>
    </form>
  );
}
