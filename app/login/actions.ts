"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  constantTimeEqual,
  createSessionToken,
  getAuthConfig,
  sessionCookieOptions,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";
import { safeNextPath } from "@/lib/redirects";

const loginSchema = z.object({
  next: z.string().default("/"),
  password: z.string().min(1, "Enter your password."),
  username: z.string().trim().min(1, "Enter your username."),
});

export type LoginFormState = {
  message?: string;
  values?: {
    username: string;
  };
};

export async function login(
  _previousState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const values = {
    next: String(formData.get("next") ?? "/"),
    password: String(formData.get("password") ?? ""),
    username: String(formData.get("username") ?? ""),
  };
  const result = loginSchema.safeParse(values);

  if (!result.success) {
    return {
      message: "Enter the username and password for this journal.",
      values: { username: values.username },
    };
  }

  const config = getAuthConfig();

  if (!config) {
    return {
      message:
        "Authentication is not configured yet. Add the Abide login environment variables before using this public deployment.",
      values: { username: result.data.username },
    };
  }

  const usernameMatches = constantTimeEqual(
    result.data.username,
    config.username,
  );
  const passwordMatches = constantTimeEqual(
    result.data.password,
    config.password,
  );

  if (!usernameMatches || !passwordMatches) {
    return {
      message: "Those details did not open this journal.",
      values: { username: result.data.username },
    };
  }

  const cookieStore = await cookies();
  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: await createSessionToken(config.username),
    ...sessionCookieOptions,
  });

  revalidatePath("/");
  redirect(safeNextPath(result.data.next));
}

export async function logout() {
  const cookieStore = await cookies();

  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/login");
}
