import { signOutAction } from "@/app/sign-out/actions";
import { AppButton } from "@/components/ui/app-button";

type Props = {
  className?: string;
};

export function SignOutButton({ className }: Props) {
  return (
    <form action={signOutAction}>
      {className ? (
        <button type="submit" className={className}>
          Sign out
        </button>
      ) : (
        <AppButton type="submit" variant="secondary">
          Sign out
        </AppButton>
      )}
    </form>
  );
}
