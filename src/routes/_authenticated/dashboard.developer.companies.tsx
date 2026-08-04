import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  Loader2,
  MoreHorizontal,
  Pencil,
  Plus,
  Power,
  Search,
  Trash2,
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
import {
  CompanyFormDialog,
  type CompanyFormValues,
} from "@/components/dashboard/company-form-dialog";
import {
  createCompany,
  deleteCompany,
  listCompanies,
  listCompanyCountries,
  setCompanyStatus,
  updateCompany,
  type CompanyRow,
} from "@/lib/companies.functions";
import { COUNTRIES } from "@/lib/company-options";

export const Route = createFileRoute("/_authenticated/dashboard/developer/companies")({
  head: () => ({
    meta: [
      { title: "Company Management — SATS Developer Console" },
      {
        name: "description",
        content:
          "Add, edit, suspend, and remove tenant companies with search, filters, and pagination.",
      },
      { property: "og:title", content: "Company Management — SATS Developer Console" },
      {
        property: "og:description",
        content: "Manage tenant companies, credentials, and status from the SATS console.",
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
  const fetchCompanies = useServerFn(listCompanies);
  const fetchCountries = useServerFn(listCompanyCountries);
  const create = useServerFn(createCompany);
  const update = useServerFn(updateCompany);
  const setStatus = useServerFn(setCompanyStatus);
  const remove = useServerFn(deleteCompany);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<CompanyRow | null>(null);
  const [pendingDelete, setPendingDelete] = useState<CompanyRow | null>(null);

  const listKey = ["companies", { search, statusFilter, countryFilter, page }] as const;

  const list = useQuery({
    queryKey: listKey,
    queryFn: () =>
      fetchCompanies({
        data: {
          search,
          status: statusFilter,
          country: countryFilter,
          page,
          pageSize: PAGE_SIZE,
        },
      }),
  });

  const countries = useQuery({
    queryKey: ["company-countries"],
    queryFn: () => fetchCountries({}),
  });

  const countryOptions = useMemo(() => {
    const set = new Set<string>([...(countries.data ?? []), ...COUNTRIES]);
    return Array.from(set).sort();
  }, [countries.data]);

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: ["companies"] });
    void queryClient.invalidateQueries({ queryKey: ["company-countries"] });
  }

  const saveMutation = useMutation({
    mutationFn: async (values: CompanyFormValues) => {
      const payload = {
        name: values.name.trim(),
        code: values.code.trim(),
        login_id: values.login_id.trim(),
        country: values.country,
        timezone: values.timezone,
        logo_url: values.logo_url,
        status: values.status,
        admin_name: values.admin_name.trim(),
        admin_email: values.admin_email.trim(),
      };
      if (editing) {
        return update({
          data: {
            id: editing.id,
            ...payload,
            ...(values.password ? { password: values.password } : {}),
          },
        });
      }
      return create({ data: { ...payload, password: values.password } });
    },
    onSuccess: () => {
      toast.success(editing ? "Company updated" : "Company created");
      setFormOpen(false);
      setEditing(null);
      refresh();
    },
    onError: (error: Error) => toast.error(error.message ?? "Could not save company"),
  });

  const statusMutation = useMutation({
    mutationFn: (row: CompanyRow) =>
      setStatus({
        data: { id: row.id, status: row.status === "active" ? "suspended" : "active" },
      }),
    onSuccess: () => {
      toast.success("Company status updated");
      refresh();
    },
    onError: (error: Error) => toast.error(error.message ?? "Could not update status"),
  });

  const deleteMutation = useMutation({
    mutationFn: (row: CompanyRow) => remove({ data: { id: row.id } }),
    onSuccess: () => {
      toast.success("Company deleted");
      setPendingDelete(null);
      refresh();
    },
    onError: (error: Error) => toast.error(error.message ?? "Could not delete company"),
  });

  const rows = list.data?.rows ?? [];
  const total = list.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">Company Management</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Onboard tenants, manage credentials, suspend or remove access.
            </p>
          </div>
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add company
          </Button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative sm:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search name, code, login ID or admin email"
              value={search}
              maxLength={100}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
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
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={countryFilter}
            onValueChange={(v) => {
              setCountryFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All countries</SelectItem>
              {countryOptions.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead className="hidden md:table-cell">Code</TableHead>
                <TableHead className="hidden lg:table-cell">Login ID</TableHead>
                <TableHead className="hidden lg:table-cell">Country / TZ</TableHead>
                <TableHead className="hidden xl:table-cell">Company admin</TableHead>
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
                      icon={Building2}
                      title="No companies found"
                      description="Add your first tenant company or adjust the filters above."
                    />
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-gradient-primary text-primary-foreground">
                          {row.logo_url ? (
                            <img
                              src={row.logo_url}
                              alt={`${row.name} logo`}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <Building2 className="h-4 w-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">{row.name}</p>
                          <p className="truncate text-xs text-muted-foreground md:hidden">
                            {row.code}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">{row.code}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">{row.login_id}</TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      <span className="block">{row.country || "—"}</span>
                      <span className="block text-xs text-muted-foreground">{row.timezone}</span>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-sm">
                      <span className="block">{row.admin_name || "—"}</span>
                      <span className="block text-xs text-muted-foreground">
                        {row.admin_email || "—"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={row.status === "active" ? "default" : "secondary"}>
                        {row.status === "active" ? "Active" : "Suspended"}
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
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => statusMutation.mutate(row)}>
                            <Power className="mr-2 h-4 w-4" />
                            {row.status === "active" ? "Suspend" : "Activate"}
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
                ))
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

      <CompanyFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        company={editing}
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
              This permanently removes the company record and its company login account. This action
              cannot be undone.
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
