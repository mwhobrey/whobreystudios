"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";

type Client = {
  id: number;
  user_id: string | null;
  full_name: string;
  business_name: string | null;
  email: string | null;
  phone: string | null;
  preferred_contact_method: string | null;
  notes: string | null;
};

type Project = {
  id: number;
  client_id: number;
  title: string;
  media_type: string | null;
  description: string | null;
  deadline: string | null;
  status: string | null;
  total_price: number | null;
  deposit_required: number | null;
  remaining_balance: number | null;
  special_notes: string | null;
  file_types_included: string | null;
  expected_completion_date: string | null;
  tracking_number: string | null;
  pickup_deadline: string | null;
};

type Payment = {
  id: number;
  project_id: number;
  payment_type: string | null;
  amount: number | null;
  status: string | null;
  payment_method: string | null;
  due_date: string | null;
  paid_date: string | null;
};

type FileItem = {
  id: number;
  project_id: number;
  file_name: string | null;
  category: string | null;
  access_level: string | null;
  uploaded_by: string | null;
  upload_date: string | null;
  version_number: string | null;
  file_type: string | null;
  client_visible_note: string | null;
  approval_status: string | null;
};

type MessageItem = {
  id: number;
  project_id: number;
  sender_name: string | null;
  message_type: string | null;
  message_body: string | null;
  sent_at: string | null;
  read_status: boolean | null;
  resolved_status: boolean | null;
};

type ViewMode = "owner" | "client";

function money(value: number | null) {
  return `$${Number(value ?? 0).toFixed(2)}`;
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function statusTone(status: string | null) {
  switch (status) {
    case "New Inquiry":
      return "bg-slate-800 text-slate-100";
    case "Consultation Scheduled":
      return "bg-blue-900/40 text-blue-200";
    case "Quote Sent":
      return "bg-indigo-900/40 text-indigo-200";
    case "Awaiting Authorization":
      return "bg-amber-900/40 text-amber-200";
    case "Awaiting Deposit":
      return "bg-orange-900/40 text-orange-200";
    case "Scheduled to Start":
      return "bg-cyan-900/40 text-cyan-200";
    case "In Progress":
      return "bg-violet-900/40 text-violet-200";
    case "Proof Sent":
      return "bg-fuchsia-900/40 text-fuchsia-200";
    case "Revision Requested":
      return "bg-yellow-900/40 text-yellow-200";
    case "Awaiting Final Approval":
      return "bg-sky-900/40 text-sky-200";
    case "Awaiting Final Payment":
      return "bg-rose-900/40 text-rose-200";
    case "Ready for Delivery":
      return "bg-emerald-900/40 text-emerald-200";
    case "Delivered / Shipped":
    case "Completed":
      return "bg-green-900/40 text-green-200";
    case "On Hold":
      return "bg-zinc-700 text-zinc-200";
    default:
      return "bg-zinc-800 text-zinc-200";
  }
}

function accessTone(level: string | null) {
  switch (level) {
    case "Authorized Download":
      return "bg-emerald-900/40 text-emerald-200";
    case "View Only":
      return "bg-blue-900/40 text-blue-200";
    case "Internal Only":
      return "bg-zinc-700 text-zinc-200";
    default:
      return "bg-zinc-800 text-zinc-200";
  }
}

function paymentTone(status: string | null) {
  switch (status) {
    case "Paid":
      return "bg-green-900/40 text-green-200";
    case "Unpaid":
      return "bg-rose-900/40 text-rose-200";
    case "Partial":
      return "bg-amber-900/40 text-amber-200";
    default:
      return "bg-zinc-800 text-zinc-200";
  }
}

function approvalTone(status: string | null) {
  switch (status) {
    case "Approved":
      return "bg-green-900/40 text-green-200";
    case "Pending":
      return "bg-amber-900/40 text-amber-200";
    case "Needs Revision":
      return "bg-rose-900/40 text-rose-200";
    default:
      return "bg-zinc-800 text-zinc-200";
  }
}

function messageTypeTone(type: string | null) {
  switch (type) {
    case "Project Update":
      return "bg-blue-900/40 text-blue-200";
    case "Question":
      return "bg-amber-900/40 text-amber-200";
    case "Revision Request":
      return "bg-rose-900/40 text-rose-200";
    case "Approval":
      return "bg-green-900/40 text-green-200";
    case "Internal Note":
      return "bg-zinc-700 text-zinc-200";
    default:
      return "bg-zinc-800 text-zinc-200";
  }
}

function shouldClientSeeFile(file: FileItem, project: Project | null) {
  if (file.access_level === "Internal Only") return false;

  const projectStatus = project?.status ?? "";
  const proofWindowStatuses = [
    "Proof Sent",
    "Revision Requested",
    "Awaiting Final Approval",
    "Awaiting Final Payment",
    "Ready for Delivery",
    "Delivered / Shipped",
    "Completed",
  ];

  const isApproved = file.approval_status === "Approved";
  const isProofDuringProofWindow =
    file.category === "Proof" && proofWindowStatuses.includes(projectStatus);

  return isApproved || isProofDuringProofWindow;
}

function clientStatusCopy(status: string | null) {
  switch (status) {
    case "New Inquiry":
      return "We received your project request.";
    case "Consultation Scheduled":
      return "Your consultation has been scheduled.";
    case "Quote Sent":
      return "Your quote has been sent for review.";
    case "Awaiting Authorization":
      return "We are waiting for approval to begin.";
    case "Awaiting Deposit":
      return "We are waiting on the deposit before work starts.";
    case "Scheduled to Start":
      return "Your project is scheduled to begin soon.";
    case "In Progress":
      return "Your project is currently being worked on.";
    case "Proof Sent":
      return "A proof has been shared for your review.";
    case "Revision Requested":
      return "Revisions are in progress based on feedback.";
    case "Awaiting Final Approval":
      return "We are waiting for final approval.";
    case "Awaiting Final Payment":
      return "Final payment is needed before final delivery.";
    case "Ready for Delivery":
      return "Your project is ready for delivery.";
    case "Delivered / Shipped":
      return "Your project has been delivered or shipped.";
    case "Completed":
      return "This project is complete.";
    case "On Hold":
      return "This project is currently on hold.";
    default:
      return "Project status available in portal.";
  }
}

function clientPortalGuidance(project: Project | null, remainingBalance: number) {
  const status = project?.status ?? "";

  switch (status) {
    case "Awaiting Deposit":
      return "Your project is ready to begin once the deposit is received.";
    case "In Progress":
      return "Work is actively underway. You will see updates here as progress is made.";
    case "Proof Sent":
      return "Please review the proof and send any requested changes.";
    case "Revision Requested":
      return "Requested revisions are being worked on now.";
    case "Awaiting Final Approval":
      return "Please confirm final approval so the project can move forward.";
    case "Awaiting Final Payment":
      return remainingBalance > 0
        ? `Final payment of ${money(remainingBalance)} is still outstanding before delivery.`
        : "Final payment is being wrapped up before delivery.";
    case "Ready for Delivery":
      return "Your finished files are ready and visible below.";
    case "Delivered / Shipped":
      return "Delivery has been completed. Check files and status details below.";
    case "Completed":
      return remainingBalance > 0
        ? `Project is marked complete, but ${money(remainingBalance)} still appears outstanding in the records.`
        : "This project is complete. Approved deliverables remain available below.";
    default:
      return clientStatusCopy(status);
  }
}

export default function HomePage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState("");

  const [viewMode, setViewMode] = useState<ViewMode>("owner");
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [authEmail, setAuthEmail] = useState<string>("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  async function loadAuth() {
    setAuthLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const user = session?.user ?? null;
    setAuthUserId(user?.id ?? null);
    setAuthEmail(user?.email ?? "");
    setAuthLoading(false);
  }

  async function loadData() {
    setLoading(true);
    setError("");

    const [
      { data: clientsData, error: clientsError },
      { data: projectsData, error: projectsError },
      { data: paymentsData, error: paymentsError },
      { data: filesData, error: filesError },
      { data: messagesData, error: messagesError },
    ] = await Promise.all([
      supabase.from("clients").select("*").order("id", { ascending: true }),
      supabase.from("projects").select("*").order("id", { ascending: true }),
      supabase.from("payments").select("*").order("id", { ascending: true }),
      supabase.from("files").select("*").order("id", { ascending: true }),
      supabase.from("messages").select("*").order("id", { ascending: true }),
    ]);

    const firstError =
      clientsError ||
      projectsError ||
      paymentsError ||
      filesError ||
      messagesError;

    if (firstError) {
      setError(firstError.message);
      setLoading(false);
      return;
    }

    const safeClients = clientsData ?? [];
    const safeProjects = projectsData ?? [];
    const safePayments = paymentsData ?? [];
    const safeFiles = filesData ?? [];
    const safeMessages = messagesData ?? [];

    setClients(safeClients);
    setProjects(safeProjects);
    setPayments(safePayments);
    setFiles(safeFiles);
    setMessages(safeMessages);

    setSelectedProjectId((current) => {
      if (current && safeProjects.some((p) => p.id === current)) return current;
      return safeProjects[0]?.id ?? null;
    });

    setLoading(false);
  }

  useEffect(() => {
    loadAuth();
    loadData();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      setAuthUserId(user?.id ?? null);
      setAuthEmail(user?.email ?? "");
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const ownerSelectedProject =
    projects.find((project) => project.id === selectedProjectId) ?? projects[0] ?? null;

  const ownerSelectedClient =
    clients.find((client) => client.id === ownerSelectedProject?.client_id) ?? null;

  const authLinkedClient =
    clients.find((client) => client.user_id === authUserId) ?? null;

  const clientPortalProjects = useMemo(
    () => projects.filter((project) => project.client_id === authLinkedClient?.id),
    [projects, authLinkedClient]
  );

  const selectedProject =
    viewMode === "client"
      ? clientPortalProjects.find((project) => project.id === selectedProjectId) ??
        clientPortalProjects[0] ??
        null
      : ownerSelectedProject;

  const selectedClient =
    viewMode === "client" ? authLinkedClient : ownerSelectedClient;

  useEffect(() => {
    if (viewMode === "client") {
      setSelectedProjectId((current) => {
        if (current && clientPortalProjects.some((p) => p.id === current)) return current;
        return clientPortalProjects[0]?.id ?? null;
      });
    }
  }, [viewMode, clientPortalProjects]);

  const visibleProjects = viewMode === "client" ? clientPortalProjects : projects;

  const selectedPaymentsRaw = useMemo(
    () => payments.filter((payment) => payment.project_id === selectedProject?.id),
    [payments, selectedProject]
  );

  const selectedFilesRaw = useMemo(
    () => files.filter((file) => file.project_id === selectedProject?.id),
    [files, selectedProject]
  );

  const selectedMessagesRaw = useMemo(
    () =>
      messages
        .filter((message) => message.project_id === selectedProject?.id)
        .sort((a, b) => {
          const aTime = a.sent_at ? new Date(a.sent_at).getTime() : 0;
          const bTime = b.sent_at ? new Date(b.sent_at).getTime() : 0;
          return bTime - aTime;
        }),
    [messages, selectedProject]
  );

  const selectedPayments =
    viewMode === "client"
      ? selectedPaymentsRaw.filter((payment) =>
          ["Unpaid", "Partial", "Paid"].includes(payment.status ?? "")
        )
      : selectedPaymentsRaw;

  const selectedFiles =
    viewMode === "client"
      ? selectedFilesRaw.filter((file) => shouldClientSeeFile(file, selectedProject))
      : selectedFilesRaw;

  const selectedMessages =
    viewMode === "client"
      ? selectedMessagesRaw.filter((message) => message.message_type !== "Internal Note")
      : selectedMessagesRaw;

  const activeProjects = useMemo(
    () =>
      projects.filter(
        (project) => project.status !== "Completed" && project.status !== "On Hold"
      ),
    [projects]
  );

  const awaitingDepositCount = useMemo(
    () => projects.filter((project) => project.status === "Awaiting Deposit").length,
    [projects]
  );

  const urgentCount = useMemo(
    () =>
      projects.filter((project) =>
        [
          "Awaiting Deposit",
          "Awaiting Final Payment",
          "Revision Requested",
          "Awaiting Authorization",
        ].includes(project.status ?? "")
      ).length,
    [projects]
  );

  const totalOutstanding = useMemo(
    () =>
      projects.reduce((sum, project) => sum + Number(project.remaining_balance ?? 0), 0),
    [projects]
  );

  const unpaidPaymentsCount = useMemo(
    () => payments.filter((payment) => payment.status === "Unpaid").length,
    [payments]
  );

  const clientPaidTotal = useMemo(
    () =>
      selectedPaymentsRaw
        .filter((payment) => payment.status === "Paid")
        .reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0),
    [selectedPaymentsRaw]
  );

  const clientOutstandingFromPayments = useMemo(
    () =>
      selectedPaymentsRaw
        .filter((payment) => payment.status === "Unpaid" || payment.status === "Partial")
        .reduce((sum, payment) => sum + Number(payment.amount ?? 0), 0),
    [selectedPaymentsRaw]
  );

  const clientRemainingBalance = Number(selectedProject?.remaining_balance ?? 0);
  const clientDisplayOutstanding =
    clientRemainingBalance > 0 ? clientRemainingBalance : clientOutstandingFromPayments;
  const clientVisibleFileCount = selectedFiles.length;
  const clientGuidance = clientPortalGuidance(selectedProject, clientDisplayOutstanding);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoginError("");
    setLoggingIn(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim(),
      password: loginPassword,
    });

    if (error) {
      setLoginError(error.message);
      setLoggingIn(false);
      return;
    }

    setLoginPassword("");
    setLoggingIn(false);
    await loadAuth();
    await loadData();
    setViewMode("client");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setViewMode("owner");
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {viewMode === "owner" ? "Whobrey Studios" : "Client Portal"}
            </h1>
            <p className="mt-1 text-zinc-400">
              {viewMode === "owner" ? "Owner dashboard" : "Authenticated client project view"}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setViewMode("owner")}
              className={`rounded-xl px-4 py-2 font-medium ${
                viewMode === "owner"
                  ? "bg-white text-black"
                  : "border border-zinc-700 text-white"
              }`}
            >
              Owner View
            </button>

            <button
              onClick={() => setViewMode("client")}
              className={`rounded-xl px-4 py-2 font-medium ${
                viewMode === "client"
                  ? "bg-white text-black"
                  : "border border-zinc-700 text-white"
              }`}
            >
              Client View
            </button>
          </div>
        </div>

        {viewMode === "client" && !authLoading && !authUserId ? (
          <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <h2 className="mb-4 text-2xl font-semibold">Client Login</h2>

            {loginError ? (
              <div className="mb-4 rounded-xl border border-red-800 bg-red-950 p-3 text-sm text-red-200">
                {loginError}
              </div>
            ) : null}

            <form onSubmit={handleLogin} className="grid max-w-2xl gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-zinc-400">Email</label>
                <input
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm text-zinc-400">Password</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={loggingIn}
                  className="rounded-xl bg-white px-4 py-2 font-medium text-black disabled:opacity-60"
                >
                  {loggingIn ? "Signing in..." : "Sign In"}
                </button>
              </div>
            </form>
          </div>
        ) : null}

        {viewMode === "client" && authUserId ? (
          <div className="mb-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm text-zinc-400">Signed in as</div>
                <div className="font-medium">{authEmail || "Authenticated user"}</div>
                <div className="mt-1 text-sm text-zinc-500">
                  {authLinkedClient
                    ? `Linked client: ${authLinkedClient.full_name}`
                    : "No linked client record found for this login."}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="rounded-xl border border-zinc-700 px-4 py-2 text-white"
              >
                Log Out
              </button>
            </div>
          </div>
        ) : null}

        {viewMode === "client" && authUserId && !authLinkedClient ? (
          <div className="mb-6 rounded-2xl border border-red-800 bg-red-950 p-4 text-red-200">
            This login is authenticated, but it is not linked to any row in the clients table.
            Add this user’s UUID to `clients.user_id`.
          </div>
        ) : null}

        {error ? (
          <div className="mb-6 rounded-2xl border border-red-800 bg-red-950 p-4 text-red-200">
            {error}
          </div>
        ) : null}

        {viewMode === "owner" ? (
          <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
              <div className="text-sm text-zinc-400">Active Projects</div>
              <div className="mt-2 text-2xl font-bold">{loading ? "..." : activeProjects.length}</div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
              <div className="text-sm text-zinc-400">Awaiting Deposit</div>
              <div className="mt-2 text-2xl font-bold">{loading ? "..." : awaitingDepositCount}</div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
              <div className="text-sm text-zinc-400">Overdue / Urgent</div>
              <div className="mt-2 text-2xl font-bold">{loading ? "..." : urgentCount}</div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
              <div className="text-sm text-zinc-400">Outstanding Balance</div>
              <div className="mt-2 text-2xl font-bold">{loading ? "..." : money(totalOutstanding)}</div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
              <div className="text-sm text-zinc-400">Unpaid Payments</div>
              <div className="mt-2 text-2xl font-bold">{loading ? "..." : unpaidPaymentsCount}</div>
            </div>
          </div>
        ) : (
          <div className="mb-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
              <div className="text-sm text-zinc-400">Client</div>
              <div className="mt-2 text-2xl font-bold">{selectedClient?.full_name ?? "—"}</div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
              <div className="text-sm text-zinc-400">Project Status</div>
              <div className="mt-2 text-2xl font-bold">{selectedProject?.status ?? "—"}</div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
              <div className="text-sm text-zinc-400">Remaining Balance</div>
              <div className="mt-2 text-2xl font-bold">{money(clientDisplayOutstanding)}</div>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
              <div className="text-sm text-zinc-400">Approved / Visible Files</div>
              <div className="mt-2 text-2xl font-bold">{clientVisibleFileCount}</div>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {viewMode === "owner" ? "Projects" : "My Projects"}
              </h2>
              <span className="text-sm text-zinc-400">{visibleProjects.length} total</span>
            </div>

            {loading ? (
              <div className="text-zinc-400">Loading projects...</div>
            ) : visibleProjects.length === 0 ? (
              <div className="text-zinc-400">No projects yet.</div>
            ) : (
              <div className="space-y-3">
                {visibleProjects.map((project) => {
                  const client = clients.find((item) => item.id === project.client_id);

                  return (
                    <button
                      key={project.id}
                      onClick={() => setSelectedProjectId(project.id)}
                      className={`w-full rounded-xl border p-4 text-left transition ${
                        selectedProject?.id === project.id
                          ? "border-white bg-zinc-800"
                          : "border-zinc-700 bg-zinc-950 hover:bg-zinc-900"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold">{project.title}</div>
                          <div className="mt-1 text-sm text-zinc-400">
                            {viewMode === "owner"
                              ? client?.full_name ?? "Unknown client"
                              : project.media_type ?? "Project"}
                          </div>
                        </div>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusTone(project.status)}`}>
                          {project.status ?? "No status"}
                        </span>
                      </div>

                      <div className="mt-3 grid gap-1 text-sm text-zinc-400">
                        <div>{project.media_type ?? "No media type"}</div>
                        <div>Due {formatDate(project.deadline)}</div>
                        <div>
                          {viewMode === "owner"
                            ? `Balance ${money(project.remaining_balance)}`
                            : clientStatusCopy(project.status)}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                <div className="text-sm text-zinc-400">Project</div>
                <div className="mt-2 text-xl font-bold">{selectedProject?.title ?? "—"}</div>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                <div className="text-sm text-zinc-400">Status</div>
                <div className="mt-2 text-xl font-bold">{selectedProject?.status ?? "—"}</div>
              </div>
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                <div className="text-sm text-zinc-400">
                  {viewMode === "owner" ? "Remaining Balance" : "Outstanding"}
                </div>
                <div className="mt-2 text-xl font-bold">
                  {viewMode === "owner"
                    ? selectedProject
                      ? money(selectedProject.remaining_balance)
                      : "—"
                    : money(clientDisplayOutstanding)}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
              <h2 className="mb-4 text-2xl font-semibold">
                {viewMode === "owner" ? "Project Summary" : "Project Overview"}
              </h2>

              {!selectedProject ? (
                <div className="text-zinc-400">Select a project to view details.</div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <div className="text-sm text-zinc-400">Client</div>
                    <div className="mt-1 font-medium">{selectedClient?.full_name ?? "—"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-zinc-400">Business</div>
                    <div className="mt-1 font-medium">{selectedClient?.business_name ?? "—"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-zinc-400">Email</div>
                    <div className="mt-1 font-medium">{selectedClient?.email ?? "—"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-zinc-400">Phone</div>
                    <div className="mt-1 font-medium">{selectedClient?.phone ?? "—"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-zinc-400">Preferred Contact</div>
                    <div className="mt-1 font-medium">
                      {selectedClient?.preferred_contact_method ?? "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-zinc-400">Media Type</div>
                    <div className="mt-1 font-medium">{selectedProject.media_type ?? "—"}</div>
                  </div>
                  <div>
                    <div className="text-sm text-zinc-400">Deadline</div>
                    <div className="mt-1 font-medium">{formatDate(selectedProject.deadline)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-zinc-400">Expected Completion</div>
                    <div className="mt-1 font-medium">
                      {formatDate(selectedProject.expected_completion_date)}
                    </div>
                  </div>

                  {viewMode === "owner" ? (
                    <>
                      <div>
                        <div className="text-sm text-zinc-400">Total Price</div>
                        <div className="mt-1 font-medium">{money(selectedProject.total_price)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-zinc-400">Deposit Required</div>
                        <div className="mt-1 font-medium">
                          {money(selectedProject.deposit_required)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-zinc-400">Remaining Balance</div>
                        <div className="mt-1 font-medium">
                          {money(selectedProject.remaining_balance)}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <div className="text-sm text-zinc-400">Amount Paid So Far</div>
                        <div className="mt-1 font-medium">{money(clientPaidTotal)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-zinc-400">Remaining Balance</div>
                        <div className="mt-1 font-medium">{money(clientDisplayOutstanding)}</div>
                      </div>
                    </>
                  )}

                  <div>
                    <div className="text-sm text-zinc-400">File Types Included</div>
                    <div className="mt-1 font-medium">
                      {selectedProject.file_types_included ?? "—"}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <div className="text-sm text-zinc-400">Description</div>
                    <div className="mt-1 font-medium">{selectedProject.description ?? "—"}</div>
                  </div>

                  {viewMode === "owner" ? (
                    <div className="md:col-span-2">
                      <div className="text-sm text-zinc-400">Special Notes</div>
                      <div className="mt-1 font-medium">{selectedProject.special_notes ?? "—"}</div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Payments</h3>
                </div>

                {selectedPayments.length === 0 ? (
                  <div className="text-zinc-400">
                    {viewMode === "client" ? "No client-visible payment records." : "No payments yet."}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedPayments.map((payment) => (
                      <div key={payment.id} className="rounded-xl border border-zinc-700 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="font-medium">{payment.payment_type ?? "Payment"}</div>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${paymentTone(payment.status)}`}>
                            {payment.status ?? "Unknown"}
                          </span>
                        </div>

                        <div className="mt-2 space-y-1 text-sm text-zinc-400">
                          <div>Amount: {money(payment.amount)}</div>
                          {viewMode === "owner" ? (
                            <div>Method: {payment.payment_method ?? "—"}</div>
                          ) : null}
                          <div>Due: {formatDate(payment.due_date)}</div>
                          <div>Paid: {formatDate(payment.paid_date)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Files</h3>
                </div>

                {selectedFiles.length === 0 ? (
                  <div className="text-zinc-400">
                    {viewMode === "client"
                      ? "No approved or visible files are available yet."
                      : "No files yet."}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedFiles.map((file) => (
                      <div key={file.id} className="rounded-xl border border-zinc-700 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="font-medium">{file.file_name ?? "Unnamed file"}</div>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${accessTone(file.access_level)}`}>
                            {file.access_level ?? "Unknown"}
                          </span>
                        </div>

                        <div className="mt-2 space-y-1 text-sm text-zinc-400">
                          <div>Category: {file.category ?? "—"}</div>
                          {viewMode === "owner" ? (
                            <div>Uploaded by: {file.uploaded_by ?? "—"}</div>
                          ) : null}
                          <div>Upload date: {formatDate(file.upload_date)}</div>
                          <div>Version: {file.version_number ?? "—"}</div>
                          <div className="flex items-center gap-2">
                            <span>Approval:</span>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${approvalTone(file.approval_status)}`}>
                              {file.approval_status ?? "Unknown"}
                            </span>
                          </div>
                          {file.client_visible_note ? (
                            <div className="pt-1 text-zinc-200">
                              {viewMode === "client"
                                ? file.client_visible_note
                                : `Client note: ${file.client_visible_note}`}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Messages</h3>
                </div>

                {selectedMessages.length === 0 ? (
                  <div className="text-zinc-400">
                    {viewMode === "client" ? "No client-visible messages yet." : "No messages yet."}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedMessages.slice(0, 5).map((message) => (
                      <div key={message.id} className="rounded-xl border border-zinc-700 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="font-medium">{message.sender_name ?? "Unknown sender"}</div>
                          <div className="text-xs text-zinc-500">{formatDateTime(message.sent_at)}</div>
                        </div>

                        <div className="mt-2 flex items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${messageTypeTone(message.message_type)}`}>
                            {message.message_type ?? "Message"}
                          </span>
                        </div>

                        <div className="mt-2 text-sm text-zinc-200">
                          {message.message_body ?? "—"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {viewMode === "owner" ? (
              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                  <div className="text-sm text-zinc-400">Client Records</div>
                  <div className="mt-2 text-2xl font-bold">{clients.length}</div>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                  <div className="text-sm text-zinc-400">Projects</div>
                  <div className="mt-2 text-2xl font-bold">{projects.length}</div>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                  <div className="text-sm text-zinc-400">Files</div>
                  <div className="mt-2 text-2xl font-bold">{files.length}</div>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                  <div className="text-sm text-zinc-400">Connection</div>
                  <div className="mt-2 text-2xl font-bold">
                    {loading ? "Loading..." : "Connected"}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-[1fr_320px]">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                  <h3 className="mb-3 text-xl font-semibold">Next Steps</h3>
                  <p className="text-zinc-300">{clientGuidance}</p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                  <h3 className="mb-3 text-xl font-semibold">Portal Rules</h3>
                  <div className="space-y-2 text-sm text-zinc-300">
                    <div>• You only see projects linked to your login.</div>
                    <div>• Internal-only files and notes stay hidden.</div>
                    <div>• Approved and client-visible proof files appear here.</div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}