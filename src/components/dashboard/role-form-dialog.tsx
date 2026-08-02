import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PermissionMatrix } from "@/components/dashboard/permission-matrix";
import {
  ROLE_SUGGESTIONS,
  countGrants,
  emptyPermissionMatrix,
  type RolePermissionRow,
  type RoleRow,
} from "@/lib/roles.shared";

export interface RoleFormValues {
  name: string;
  code: string;
  description: string;
  scope: "platform" | "company";
  company_id: string | null;
  status: "active" | "inactive";
  permissions: RolePermissionRow[];
}

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: RoleRow | null;
  companies: { id: string; name: string; code: string }[];
  defaultCompanyId?: string | undefined;
  saving: boolean;
  onSubmit: (values: RoleFormValues) => Promise<void>;
}

export function RoleFormDialog({
  open,
  onOpenChange,
  role,
  companies,
  defaultCompanyId,
  saving,
  onSubmit,
}: RoleFormDialogProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [scope, setScope] = useState<"platform" | "company">("company");
  const [companyId, setCompanyId] = useState<string>("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [matrix, setMatrix] = useState<Record<string, RolePermissionRow>>(emptyPermissionMatrix);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setName(role?.name ?? "");
    setCode(role?.code ?? "");
    setDescription(role?.description ?? "");
    setScope(role?.scope ?? "company");
    setCompanyId(role?.company_id ?? defaultCompanyId ?? "");
    setStatus(role?.status ?? "active");
    const base = emptyPermissionMatrix();
    for (const p of role?.role_permissions ?? []) {
      if (base[p.module]) base[p.module] = { ...p };
    }
    setMatrix(base);
  }, [open, role, defaultCompanyId]);

  const grants = countGrants(Object.values(matrix));

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (name.trim().length < 2) {
      setError("Role name must be at least 2 characters");
      return;
    }
    if (scope === "company" && !companyId) {
      setError("Select a company for a company-scoped role");
      return;
    }
    setError(null);
    await onSubmit({
      name: name.trim(),
      code: code.trim(),
      description: description.trim(),
      scope,
      company_id: scope === "platform" ? null : companyId,
      status,
      permissions: Object.values(matrix),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{role ? "Edit role" : "Create role"}</DialogTitle>
          <DialogDescription>
            Define the role and assign module permissions using the matrix below.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="role-name">Role name</Label>
              <Input
                id="role-name"
                value={name}
                maxLength={120}
                placeholder="HR Lead"
                onChange={(e) => setName(e.target.value)}
                required
              />
              {!role ? (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {ROLE_SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                      onClick={() => setName(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role-code">Role code</Label>
              <Input
                id="role-code"
                value={code}
                maxLength={40}
                placeholder="HR_LEAD"
                onChange={(e) => setCode(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Scope</Label>
              <Select value={scope} onValueChange={(v) => setScope(v as "platform" | "company")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="platform">Platform (all tenants)</SelectItem>
                  <SelectItem value="company">Company</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Company</Label>
              <Select
                value={companyId}
                onValueChange={setCompanyId}
                disabled={scope === "platform"}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={scope === "platform" ? "Not applicable" : "Select company"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as "active" | "inactive")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="role-description">Description</Label>
              <Textarea
                id="role-description"
                value={description}
                maxLength={500}
                rows={2}
                placeholder="What this role is responsible for"
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-sm font-semibold text-foreground">
                  Permission matrix
                </h3>
                <p className="text-xs text-muted-foreground">
                  Assign View, Add, Edit, Delete, Approve and Export per module.
                </p>
              </div>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
                {grants} permission{grants === 1 ? "" : "s"} selected
              </span>
            </div>
            <PermissionMatrix value={matrix} onChange={setMatrix} disabled={saving} />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {role ? "Save changes" : "Create role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
