import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, MoreHorizontal, Pencil, Plus, Search, ShieldCheck, Trash2 } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { RoleFormDialog, type RoleFormValues } from "@/components/dashboard/role-form-dialog";
import { PERMISSION_ACTIONS, countGrants } from "@/lib/roles.shared";
import {
  createRole,
  deleteRole,
  listRoleCompanies,
  listRoles,
  updateRole,
  type RoleRow,
} from "@/lib/roles.functions";

export const Route = createFileRoute("/_authenticated/dashboard/developer/roles")({
  head: () => ({
    meta: [
      { title: "Role Management — SATS Developer Console" },
      {
        name: "description",
        content:
          "Create and edit roles with a professional permission matrix across every SATS module.",
      },
      { property: "og:title", content: "Role Management — SATS Developer Console" },
      {
        property: "og:description",
        content: "Assign View, Add, Edit, Delete, Approve and Export permissions per module.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

const PAGE_SIZE = 10;

function Page() {
  const queryClient = useQueryClient();
  const fetchRoles = useServerFn(listRoles);
  const fetchCompanies = useServerFn(listRoleCompanies);
  const create = useServerFn(createRole);
  const update = useServerFn(updateRole);
  const remove = useServerFn(deleteRole);

  const [search, setSearch] = useState("");
  const [scopeFilter, setScopeFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RoleRow | null>(null);
  const [pendingDelete, setPendingDelete] = useState<RoleRow | null>(null);

  const list = useQuery({
    queryKey: ["roles", { search, scopeFilter, companyFilter, statusFilter, page }],
    queryFn: () =>
      fetchRoles({
        data: {
          search,
          scope: scopeFilter,
          companyId: companyFilter,
          status: statusFilter,
          page,
          pageSize: PAGE_SIZE,
        },
      }),
  });

  const companies = useQuery({
    queryKey: ["role-companies"],
    queryFn: () => fetchCompanies({}),
  });

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: ["roles"] });
  }

  const saveMutation = useMutation({
    mutationFn: async (values: RoleFormValues) => {
      if (editing) return update({ data: { id: editing.id, ...values } });
      return create({ data: values });
    },
    onSuccess: () => {
      toast.success(editing ? "Role updated" : "Role created");
      setFormOpen(false);
      setEditing(null);
      refresh();
    },
    onError: (error: Error) => toast.error(error.message ?? "Could not save role"),
  });

  const deleteMutation = useMutation({
    mutationFn: (row: RoleRow) => remove({ data: { id: row.id } }),
    onSuccess: () => {
      toast.success("Role deleted");
      setPendingDelete(null);
      refresh();
    },
    onError: (error: Error) => toast.error(error.message ?? "Could not delete role"),
  });

  const rows = list.data?.rows ?? [];
  const total = list.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const companyList = companies.data ?? [];

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">Role Management</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Create roles and grant module-level permissions with a checkbox matrix.
            </p>
          </div>
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create role
          </Button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search role name or code"
              value={search}
              maxLength={100}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <Select
            value={scopeFilter}
            onValueChange={(v) => {
              setScopeFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Scope" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All scopes</SelectItem>
              <SelectItem value="platform">Platform</SelectItem>
              <SelectItem value="company">Company</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={companyFilter}
            onValueChange={(v) => {
              setCompanyFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All companies</SelectItem>
              {companyList.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead className="hidden md:table-cell">Code</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead className="hidden lg:table-cell">Company</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : list.isError ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-sm text-destructive">
                    {(list.error as Error).message}
                  </TableCell>
                </TableRow>
              ) : rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="p-4">
                    <EmptyState
                      icon={ShieldCheck}
                      title="No roles found"
                      description="Create roles such as HR Lead, Recruiter or Auditor and assign module permissions."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => {
                  const grants = countGrants(row.role_permissions ?? []);
                  const modules = (row.role_permissions ?? []).length;
                  return (
                    <TableRow key={row.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-primary text-primary-foreground">
                            <ShieldCheck className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">{row.name}</p>
                            <p className="truncate text-xs text-muted-foreground">
                              {row.description || row.code || "—"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">
                        {row.code || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={row.scope === "platform" ? "default" : "secondary"}>
                          {row.scope === "platform" ? "Platform" : "Company"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm">
                        {row.scope === "platform" ? "All tenants" : (row.companies?.name ?? "—")}
                      </TableCell>
                      <TableCell className="text-sm">
                        <span className="block">
                          {grants} of {PERMISSION_ACTIONS.length * Math.max(modules, 1)} granted
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {modules} module{modules === 1 ? "" : "s"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={row.status === "active" ? "default" : "secondary"}>
                          {row.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Actions for ${row.name}`}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditing(row);
                                setFormOpen(true);
                              }}
                            >
                              <Pencil className="mr-2 h-4 w-4" /> Edit & permissions
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setPendingDelete(row)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {total === 0
              ? "No records"
              : `Showing ${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, total)} of ${total}`}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || list.isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-xs text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || list.isFetching}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <RoleFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        role={editing}
        companies={companyList}
        defaultCompanyId={companyFilter !== "all" ? companyFilter : undefined}
        saving={saveMutation.isPending}
        onSubmit={async (values) => {
          await saveMutation.mutateAsync(values).catch(() => undefined);
        }}
      />

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {pendingDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the role and all of its permission grants. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => pendingDelete && deleteMutation.mutate(pendingDelete)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
