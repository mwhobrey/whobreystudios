import "server-only";

/** Public app base URL for links in transactional email. */
export function getAppBaseUrl(): string {
  const url = process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  return url.replace(/\/$/, "");
}

export function projectPortalUrl(projectId: string): string {
  return `${getAppBaseUrl()}/portal/projects/${projectId}`;
}

export function adminProjectUrl(projectId: string): string {
  return `${getAppBaseUrl()}/admin/projects/${projectId}`;
}

export function clientLoginUrl(): string {
  return `${getAppBaseUrl()}/login`;
}
