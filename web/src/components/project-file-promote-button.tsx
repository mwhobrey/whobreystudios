"use client";

import { useActionState } from "react";
import { ArrowUpRight } from "lucide-react";
import {
  promoteFileToFinalAction,
  type ProjectActionState,
} from "@/app/admin/projects/[id]/project-actions";
import { AppButton } from "@/components/ui/app-button";

type Props = {
  projectId: string;
  fileId: string;
};

export function ProjectFilePromoteButton({ projectId, fileId }: Props) {
  const [state, action, pending] = useActionState(promoteFileToFinalAction, {} as ProjectActionState);

  return (
    <form action={action} className="inline">
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="fileId" value={fileId} />
      <AppButton
        type="submit"
        variant="secondary"
        loading={pending}
        title={state.error ?? "Mark as final deliverable"}
        iconLeft={!pending ? <ArrowUpRight className="h-3 w-3" /> : undefined}
        className="!px-2 !py-1 text-[10px]"
      >
        Final
      </AppButton>
    </form>
  );
}
