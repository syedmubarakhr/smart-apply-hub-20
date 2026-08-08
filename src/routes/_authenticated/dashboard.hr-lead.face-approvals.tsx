import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  Check,
  Eye,
  Loader2,
  Network,
  ScanFace,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  approveFaceRegistration,
  getFaceRegistrationImages,
  listFaceRegistrations,
  rejectFaceRegistration,
  type FaceApprovalRow,
} from "@/lib/face-approvals.functions";
import { decryptFaceImage } from "@/lib/face-crypto";

export const Route = createFileRoute("/_authenticated/dashboard/hr-lead/face-approvals")({
  head: () => ({
    meta: [
      { title: "Face Registration Approval — SATS HR Lead" },
      {
        name: "description",
        content:
          "Review pending employee face registrations, inspect captured poses, and approve or reject biometric enrollment.",
      },
      { property: "og:title", content: "Face Registration Approval — SATS HR Lead" },
      {
        property: "og:description",
        content: "Approve or reject employee biometric enrollment requests.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page;
});

const PAGE_SIZE = 10;

function StatusBadge({ status }: { status: FaceApprovalRow["status"] }) {
  if (status === "approved")
    return (
      <Badge className="bg-primary/15 text-primary hover:bg-primary/15">Approved</Badge>
    );
  if (status === "rejected") return <Badge variant="destructive">Rejected</Badge>;
  return <Badge className="bg-accent/15 text-accent hover:bg-accent/15">Pending</Badge>;
}

function Thumb({ userId, payload, label }: { userId: string; payload: string; label: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const { isFetching } = useQuery({
    queryKey: ["face-thumb", userId, payload.slice(0, 24)],
    queryFn: async () => {
      try {
        setSrc(await decryptFaceImage(userId, payload));
      } catch {
        setSrc(null);
      }
      return true;
    },
    staleTime: Infinity,
  });

  return src ? (
    <img
      src={src}
      alt={label}
      loading="lazy"
      className="h-full w-full rounded-xl object-cover"
    />
  ) : (
    <div className="grid h-full w-full place-items-center rounded-xl bg-muted text-muted-foreground">
      {isFetching ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <ScanFace className="h-4 w-4" />
      )}
    </div>
  );
}

function Page() {
  const queryClient = useQueryClient();
  const fetchList = useServerFn(listFaceRegistrations);
  const fetchImages = useServerFn(getFaceRegistrationImages);
  const approve = useServerFn(approveFaceRegistration);
  const reject = useServerFn(rejectFaceRegistration);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<FaceApprovalRow | null>(null);
  const [pendingReject, setPendingReject] = useState<FaceApprovalRow | null>(null);

  const list = useQuery({
    queryKey: ["face-approvals", { search, status, page }],
    queryFn: () => fetchList({ data: { search, status, page, pageSize: PAGE_SIZE } }),
  });

  const images = useQuery({
    queryKey: ["face-approval-images", viewing?.id],
    queryFn: () => fetchImages({ data: { id: viewing!.id } }),
    enabled: Boolean(viewing),
  });

  function refresh() {
    queryClient.invalidateQueries({ queryKey: ["face-approvals"] });
  }

  const approveMutation = useMutation({
    mutationFn: (row: FaceApprovalRow) => approve({ data: { id: row.id } }),
    onSuccess: (_res, row) => {
      toast.success(`${row.display_name} approved — face verification unlocked.`);
      refresh();
    },
    onError: (err: unknown) =>
      toast.error(err instanceof Error ? err.message : "Approval failed. Please try again."),
  });

  const rejectMutation = useMutation({
    mutationFn: (row: FaceApprovalRow) => reject({ data: { id: row.id, reason: "" } }),
    onSuccess: (_res, row) => {
      toast.error(`${row.display_name} rejected — re-registration required at next login.`);
      setPendingReject(null);
      refresh();
    },
    onError: (err: unknown) =>
      toast.error(err instanceof Error ? err.message : "Rejection failed. Please try again."),
  });

  const rows = list.data?.items ?? [];
  const total = list.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const busy = approveMutation.isPending || rejectMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Face registration approvals
            <span className="text-muted-foreground">({total})</span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search name, username, company…"
                className="pl-9 sm:w-72"
              />
            </div>
            <Select
              value={status}
              onValueChange={(v) => {
                setStatus(v as typeof status);
                setPage(1);
              }}
            >
              <SelectTrigger className="sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="all">All statuses</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden rounded-2xl">
        {list.isLoading ? (
          <div className="grid h-64 place-items-center text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" /> Loading registrations…
            </span>
          </div>
        ) : list.isError ? (
          <div className="p-6">
            <EmptyState
              icon={ScanFace}
              title="Couldn't load registrations"
              description={
                list.error instanceof Error
                  ? list.error.message
                  : "Something went wrong. Please retry."
              }
            />
            <div className="mt-4 text-center">
              <Button variant="outline" onClick={() => list.refetch()}>
                Retry
              </Button>
            </div>
          </div>
        ) : rows.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={ShieldCheck}
              title="No registrations to review"
              description="New employee face registrations awaiting approval will appear here."
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 shrink-0">
                            <Thumb
                              userId={row.user_id}
                              payload={row.image_front}
                              label={`${row.display_name} front capture`}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold">{row.display_name}</p>
                            <p className="truncate text-xs text-muted-foreground">{row.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{row.username || "—"}</TableCell>
                      <TableCell className="text-sm">
                        <span className="inline-flex items-center gap-1.5">
                          <Network className="h-3.5 w-3.5 text-muted-foreground" />
                          {row.department_name ?? "Unassigned"}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        <span className="inline-flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                          {row.company_name ?? "Unassigned"}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(row.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={row.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setViewing(row)}
                            title="View registration images"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="ml-1.5 hidden sm:inline">View</span>
                          </Button>
                          <Button
                            size="sm"
                            disabled={busy || row.status === "approved"}
                            onClick={() => approveMutation.mutate(row)}
                          >
                            {approveMutation.isPending &&
                            approveMutation.variables?.id === row.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                            <span className="ml-1.5 hidden sm:inline">Approve</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={busy || row.status === "rejected"}
                            onClick={() => setPendingReject(row)}
                          >
                            <X className="h-4 w-4" />
                            <span className="ml-1.5 hidden sm:inline">Reject</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted-foreground">
              <span>
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <Dialog open={Boolean(viewing)} onOpenChange={(open) => !open && setViewing(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Registration images — {viewing?.display_name ?? "Employee"}
            </DialogTitle>
          </DialogHeader>
          {images.isLoading ? (
            <div className="grid h-48 place-items-center text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" /> Decrypting captures…
              </span>
            </div>
          ) : images.isError ? (
            <p className="py-6 text-center text-sm text-destructive">
              {images.error instanceof Error ? images.error.message : "Couldn't load images."}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {(images.data?.images ?? []).map((img) => (
                <div key={img.key} className="space-y-2">
                  <div className="aspect-square overflow-hidden rounded-xl border border-border">
                    <Thumb
                      userId={images.data!.user_id}
                      payload={img.payload}
                      label={`${img.label} capture`}
                    />
                  </div>
                  <p className="text-center text-xs font-semibold text-muted-foreground">
                    {img.label}
                  </p>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(pendingReject)}
        onOpenChange={(open) => !open && setPendingReject(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject this registration?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingReject?.display_name} will be asked to complete face registration again at
              their next login.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={rejectMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={rejectMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (pendingReject) rejectMutation.mutate(pendingReject);
              }}
            >
              {rejectMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Reject registration
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
