"use client";

import { useActionState } from "react";
import {
  updateTestimony,
  type TestimonyEditFormState,
} from "@/app/actions";

const initialState: TestimonyEditFormState = {};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="field-error">{errors[0]}</p>;
}

export function TestimonyEditForm({
  id,
  initialValues,
}: {
  id: string;
  initialValues: { title: string; body: string };
}) {
  const action = updateTestimony.bind(null, id);
  const [state, formAction, pending] = useActionState(action, initialState);
  const values = state.values ?? initialValues;

  return (
    <form action={formAction} className="reflection-form">
      <fieldset>
        <legend>Shape it in your own words</legend>
        <p className="field-help">
          This draft is private to you. Rewrite freely until it sounds like
          your story.
        </p>
        <label className="field-label" htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={120}
          defaultValue={values.title}
        />
        <FieldError errors={state.errors?.title} />
        <label className="field-label" htmlFor="body">Draft</label>
        <textarea
          id="body"
          name="body"
          rows={18}
          required
          maxLength={20000}
          defaultValue={values.body}
        />
        <FieldError errors={state.errors?.body} />
      </fieldset>

      {state.message ? (
        <p className="form-message" role="status" aria-live="polite">
          {state.message}
        </p>
      ) : null}

      <button className="button button-primary" type="submit" disabled={pending}>
        {pending ? "Saving draft…" : "Save draft"}
      </button>
    </form>
  );
}
