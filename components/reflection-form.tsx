"use client";

import { useActionState } from "react";
import {
  createReflection,
  type ReflectionFormState,
} from "@/app/actions";
import { FRUITS, FRUIT_LABELS } from "@/lib/fruits";

const initialState: ReflectionFormState = {};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="field-error">{errors[0]}</p>;
}

export function ReflectionForm() {
  const [state, formAction, pending] = useActionState(
    createReflection,
    initialState,
  );

  return (
    <form action={formAction} className="reflection-form">
      <fieldset>
        <legend>1. What happened today?</legend>
        <p className="field-help">
          Name the moment honestly. It can be ordinary, difficult, or joyful.
        </p>
        <textarea
          id="journalText"
          name="journalText"
          rows={7}
          required
          minLength={10}
          maxLength={5000}
          defaultValue={state.values?.journalText}
        />
        <FieldError errors={state.errors?.journalText} />
      </fieldset>

      <fieldset>
        <legend>2. Which fruits were present?</legend>
        <p className="field-help">
          Choose what you noticed—not what you think you should choose.
        </p>
        <div className="fruit-options">
          {FRUITS.map((fruit) => (
            <label key={fruit}>
              <input
                type="checkbox"
                name="fruits"
                value={fruit}
                defaultChecked={state.values?.fruits.includes(fruit)}
              />
              <span>{FRUIT_LABELS[fruit]}</span>
            </label>
          ))}
        </div>
        <FieldError errors={state.errors?.fruits} />
      </fieldset>

      <fieldset>
        <legend>3. Rooted in</legend>
        <p className="field-help">
          Optional. Add a Scripture reference that held meaning today.
        </p>
        <input
          id="scriptureRef"
          name="scriptureRef"
          type="text"
          maxLength={120}
          placeholder="For example, Galatians 5:22–23"
          defaultValue={state.values?.scriptureRef}
        />
        <FieldError errors={state.errors?.scriptureRef} />
      </fieldset>

      <fieldset>
        <legend>4. What is God teaching you?</legend>
        <p className="field-help">
          Capture the invitation, encouragement, or growing edge you see.
        </p>
        <textarea
          id="lessonLearned"
          name="lessonLearned"
          rows={6}
          required
          minLength={5}
          maxLength={5000}
          defaultValue={state.values?.lessonLearned}
        />
        <FieldError errors={state.errors?.lessonLearned} />
      </fieldset>

      {state.message ? (
        <p className="form-message" role="status" aria-live="polite">
          {state.message}
        </p>
      ) : null}

      <button className="button button-primary" type="submit" disabled={pending}>
        {pending ? "Saving reflection…" : "Save today’s reflection"}
      </button>
    </form>
  );
}
