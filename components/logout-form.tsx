import { logout } from "@/app/login/actions";

export function LogoutForm() {
  return (
    <form action={logout}>
      <button className="header-button" type="submit">
        Log out
      </button>
    </form>
  );
}
