"use client";

import { deleteReflection } from "@/app/actions";

export function DeleteReflectionForm({ id }: { id: string }) {
  const action = deleteReflection.bind(null, id);

  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (
          !window.confirm(
            "Delete this reflection? This cannot be undone.",
          )
        ) {
          event.preventDefault();
        }
      }}
    >
      <button className="button button-danger" type="submit">
        Delete reflection
      </button>
    </form>
  );
}
