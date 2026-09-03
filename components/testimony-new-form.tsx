"use client";

import { useActionState } from "react";
import {
  createTestimony,
  type TestimonyNewFormState,
} from "@/app/actions";
import { FruitTags } from "@/components/fruit-tags";
import { formatReflectionDate } from "@/lib/dates";
import type { FruitValue } from "@/lib/fruits";

const initialState: TestimonyNewFormState = {};

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="field-error">{errors[0]}</p>;
}

export type SelectableReflection = {
  id: string;
  reflectionDate: Date;
  fruits: FruitValue[];
  lessonLearned: string;
};

function excerpt(value: string, length = 140) {
  return value.length > length ? `${value.slice(0, length).trimEnd()}…` : value;
}

export function TestimonyNewForm({
  reflections,
}: {
  reflections: SelectableReflection[];
}) {
  const [state, formAction, pending] = useActionState(
    createTestimony,
    initialState,
  );
  const checkedIds = new Set(state.values?.reflectionIds ?? []);

  return (
    <form action={formAction} className="reflection-form">
      <fieldset>
        <legend>1. What holds these moments together?</legend>
        <p className="field-help">
          Optional. Name a theme, a fruit, or a season—for example, learning
          patience.
        </p>
        <input
          id="theme"
          name="theme"
          type="text"
          maxLength={120}
          placeholder="For example, learning patience"
          defaultValue={state.values?.theme}
        />
        <FieldError errors={state.errors?.theme} />
      </fieldset>

      <fieldset>
        <legend>2. Choose a few reflections</legend>
        <p className="field-help">
          Choose moments to gather. A small set is easier to shape into your
          own words.
        </p>
        <div className="choice-list">
          {reflections.map((reflection) => (
            <label key={reflection.id}>
              <input
                type="checkbox"
                name="reflectionIds"
                value={reflection.id}
                defaultChecked={checkedIds.has(reflection.id)}
              />
              <div>
                <strong>
                  {formatReflectionDate(reflection.reflectionDate, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </strong>
                <FruitTags fruits={reflection.fruits} />
                <span>{excerpt(reflection.lessonLearned)}</span>
              </div>
            </label>
          ))}
        </div>
        <FieldError errors={state.errors?.reflectionIds} />
      </fieldset>

      {state.message ? (
        <p className="form-message" role="status" aria-live="polite">
          {state.message}
        </p>
      ) : null}

      <button className="button button-primary" type="submit" disabled={pending}>
        {pending ? "Gathering moments…" : "Gather into a draft"}
      </button>
    </form>
  );
}
