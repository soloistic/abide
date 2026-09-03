import Link from "next/link";
import { deleteTestimony } from "@/app/actions";
import { TESTIMONY_DELETE_CONFIRM_VALUE } from "@/lib/testimony";

export function DeleteTestimonyForm({ id }: { id: string }) {
  const action = deleteTestimony.bind(null, id);

  return (
    <form action={action}>
      <input type="hidden" name="confirm" value={TESTIMONY_DELETE_CONFIRM_VALUE} />
      <div className="reflection-actions">
        <button className="button button-danger" type="submit">
          Yes, delete this draft
        </button>
        <Link className="button button-secondary" href={`/testimonies/${id}`}>
          Keep this draft
        </Link>
      </div>
    </form>
  );
}
