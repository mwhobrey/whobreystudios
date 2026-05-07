import type { MessageWithThread } from "@/lib/data/messages";
import {
  ProjectMessagesClient,
  type ProjectMessageDto,
} from "@/components/project-messages-client";

function toDto(m: MessageWithThread): ProjectMessageDto {
  return {
    id: m.id,
    body: m.body,
    parentId: m.parentId,
    createdAt: m.createdAt.toISOString(),
    author: m.author,
    parent: m.parent
      ? {
          id: m.parent.id,
          body: m.parent.body,
          author: m.parent.author,
        }
      : null,
  };
}

type Props = {
  projectId: string;
  viewerId: string;
  variant: "admin" | "portal";
  messageRows: MessageWithThread[];
};

export function ProjectMessagesSection({ projectId, viewerId, variant, messageRows }: Props) {
  const messages = messageRows.map(toDto);
  return (
    <ProjectMessagesClient
      projectId={projectId}
      viewerId={viewerId}
      variant={variant}
      messages={messages}
    />
  );
}
