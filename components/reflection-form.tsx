"use client";

import { useActionState, useState } from "react";
import {
  createReflection,
  type ReflectionFormState,
} from "@/app/actions";
import {
  FRUITS,
  FRUIT_LABELS,
  FRUIT_PROMPTS,
  type FruitValue,
} from "@/lib/fruits";

const initialState: ReflectionFormState = {};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="field-error">{errors[0]}</p>;
}

type ReflectionFormProps = {
  action?: (
    state: ReflectionFormState,
    formData: FormData,
  ) => Promise<ReflectionFormState>;
  initialValues?: {
    focusFruit: FruitValue | null;
    journalText: string;
    fruits: FruitValue[];
    scriptureRef: string;
    lessonLearned: string;
    prayerNote: string;
  };
  submitLabel?: string;
  pendingLabel?: string;
};

export function ReflectionForm({
  action = createReflection,
  initialValues,
  submitLabel = "Save today’s reflection",
  pendingLabel = "Saving reflection…",
}: ReflectionFormProps) {
  const [state, formAction, pending] = useActionState(
    action,
    initialState,
  );
  const values = state.values ?? initialValues;
  const [focusFruit, setFocusFruit] = useState<"" | FruitValue>(
    initialValues?.focusFruit ?? "",
  );
  const prompts = focusFruit ? FRUIT_PROMPTS[focusFruit] : null;
  const focusFruitLabel = focusFruit ? FRUIT_LABELS[focusFruit] : null;

  return (
    <form action={formAction} className="reflection-form">
      <fieldset>
        <legend>1. Is there a fruit you want to focus on?</legend>
        <p className="field-help">
          Optional. Choose one for a few gentle starting points.
        </p>
        <select
          id="focusFruit"
          name="focusFruit"
          value={focusFruit}
          onChange={(event) =>
            setFocusFruit(event.target.value as "" | FruitValue)
          }
        >
          <option value="">No particular focus</option>
          {FRUITS.map((fruit) => (
            <option key={fruit} value={fruit}>
              {FRUIT_LABELS[fruit]}
            </option>
          ))}
        </select>
        <FieldError errors={state.errors?.focusFruit} />
        {prompts ? (
          <aside className="prompt-card" aria-live="polite">
            <p className="eyebrow">Prompts for {focusFruitLabel}</p>
            <ul>
              {prompts.map((prompt) => (
                <li key={prompt}>{prompt}</li>
              ))}
            </ul>
            <p>Use what helps, then write freely in your own words.</p>
          </aside>
        ) : null}
      </fieldset>

      <fieldset>
        <legend>2. What happened today?</legend>
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
          defaultValue={values?.journalText}
        />
        <FieldError errors={state.errors?.journalText} />
      </fieldset>

      <fieldset>
        <legend>3. Which fruits were present?</legend>
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
                defaultChecked={values?.fruits.includes(fruit)}
              />
              <span>{FRUIT_LABELS[fruit]}</span>
            </label>
          ))}
        </div>
        <FieldError errors={state.errors?.fruits} />
      </fieldset>

      <fieldset>
        <legend>4. Rooted in</legend>
        <p className="field-help">
          Optional. Add a Scripture reference that held meaning today.
        </p>
        <input
          id="scriptureRef"
          name="scriptureRef"
          type="text"
          maxLength={120}
          placeholder="For example, Galatians 5:22–23"
          defaultValue={values?.scriptureRef}
        />
        <FieldError errors={state.errors?.scriptureRef} />
      </fieldset>

      <fieldset>
        <legend>5. What is God teaching you?</legend>
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
          defaultValue={values?.lessonLearned}
        />
        <FieldError errors={state.errors?.lessonLearned} />
      </fieldset>

      <fieldset>
        <legend>6. A prayer to carry with you</legend>
        <p className="field-help">
          Optional. Add a short prayer connected to this reflection.
        </p>
        <textarea
          id="prayerNote"
          name="prayerNote"
          rows={4}
          maxLength={5000}
          defaultValue={values?.prayerNote}
        />
        <FieldError errors={state.errors?.prayerNote} />
      </fieldset>

      {state.message ? (
        <p className="form-message" role="status" aria-live="polite">
          {state.message}
        </p>
      ) : null}

      <button className="button button-primary" type="submit" disabled={pending}>
        {pending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}
