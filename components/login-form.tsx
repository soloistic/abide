"use client";

import { useActionState } from "react";
import { login, type LoginFormState } from "@/app/login/actions";

const initialState: LoginFormState = {};

type LoginFormProps = {
  authConfigured: boolean;
  next: string;
};

export function LoginForm({ authConfigured, next }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="login-form">
      <input name="next" type="hidden" value={next} />
      <label>
        <span>Username</span>
        <input
          autoComplete="username"
          defaultValue={state.values?.username}
          disabled={!authConfigured}
          name="username"
          required
          type="text"
        />
      </label>
      <label>
        <span>Password</span>
        <input
          autoComplete="current-password"
          disabled={!authConfigured}
          name="password"
          required
          type="password"
        />
      </label>
      {!authConfigured ? (
        <p className="form-message" role="status">
          Add <code>ABIDE_AUTH_USERNAME</code>, <code>ABIDE_AUTH_PASSWORD</code>,
          and <code>ABIDE_SESSION_SECRET</code> to enable login.
        </p>
      ) : null}
      {state.message ? (
        <p className="form-message" role="status" aria-live="polite">
          {state.message}
        </p>
      ) : null}
      <button
        className="button button-primary"
        disabled={pending || !authConfigured}
        type="submit"
      >
        {pending ? "Opening journal…" : "Open journal"}
      </button>
    </form>
  );
}
