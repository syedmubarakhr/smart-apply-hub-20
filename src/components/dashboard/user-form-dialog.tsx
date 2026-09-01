import { useEffect, useMemo, useState } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { generatePassword, type ManagedUserRow } from "@/lib/users.shared";

export interface UserFormValues {
  display_name: string;
  username: string;
  email: string;
  mobile: string;
  company_id: string;
  department_id: string;
  role_id: string;
  reporting_manager_id: string | null;
  status: "active" | "inactive";
  password?: string;
}

export interface DirectoryData {
  companies: { id: string; name: string; code: string; status: string }[];
  departments: { id: string; company_id: string; name: string; status: string }[];
  roles: { id: string; company_id: string | null; name: string; scope: string; status: string }[];
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: ManagedUserRow | null;
  directory: DirectoryData;
  managers: { id: string; display_name: string | null; username: string | null }[];
  onCompanyChange: (companyId: string) => void;
  saving: boolean;
  onSubmit: (values: UserFormValues) => Promise<void>;
}

const EMPTY: UserFormValues = {
  display_name: "",
  username: "",
  email: "",
  mobile: "",
  company_id: "",
  department_id: "",
  role_id: "",
  reporting_manager_id: null,
  status: "active",
  password: "",
};

const NONE = "__none__";

export function UserFormDialog({
  open,
  onOpenChange,
  user,
  directory,
  managers,
  onCompanyChange,
  saving,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<UserFormValues>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (user) {
      setValues({
        display_name: user.display_name ?? "",
        username: user.username ?? "",
        email: user.email ?? "",
        mobile: user.mobile ?? "",
        company_id: user.company_id ?? "",
        department_id: user.department_id ?? "",
        role_id: user.role_id ?? "",
        reporting_manager_id: user.reporting_manager_id,
        status: user.status,
      });
    } else {
      setValues({ ...EMPTY, password: generatePassword() });
    }
  }, [open, user]);

  useEffect(() => {
    if (open && values.company_id) onCompanyChange(values.company_id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, values.company_id]);

  const departments = useMemo(
    () => directory.departments.filter((d) => d.company_id === values.company_id),
    [directory.departments, values.company_id],
  );

  const roles = useMemo(
    () =>
      directory.roles.filter(
        (r) => r.company_id === values.company_id || (!r.company_id && r.scope === "platform"),
      ),
    [directory.roles, values.company_id],
  );

  function set<K extends keyof UserFormValues>(key: K, value: UserFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function submit() {
    setError(null);
    if (!values.company_id) return setError("Select a company first");
    if (!values.department_id) return setError("Select a department");
    if (!values.role_id) return setError("Select a role");
    if (values.display_name.trim().length < 2) return setError("Enter the full name");
    if (values.username.trim().length < 3) return setError("Enter a username");
    if (!values.email.trim()) return setError("Enter an email address");
    if (!user && (values.password ?? "").length < 8)
      return setError("Password must be at least 8 characters");
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save user");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{user ? "Edit user" : "Add user"}</DialogTitle>
          <DialogDescription>
            Company first — departments and roles are limited to that company.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Company *</Label>
            <Select
              value={values.company_id}
              onValueChange={(v) =>
                setValues((prev) => ({
                  ...prev,
                  company_id: v,
                  department_id: "",
                  role_id: "",
                  reporting_manager_id: null,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select company" />
              </SelectTrigger>
              <SelectContent>
                {directory.companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Department *</Label>
            <Select
              value={values.department_id}
              onValueChange={(v) => set("department_id", v)}
              disabled={!values.company_id}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={values.company_id ? "Select department" : "Select company first"}
                />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {values.company_id && departments.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                This company has no departments yet.
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Role *</Label>
            <Select
              value={values.role_id}
              onValueChange={(v) => set("role_id", v)}
              disabled={!values.department_id}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={values.department_id ? "Select role" : "Select department first"}
                />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                    {r.scope === "platform" ? " (platform)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {values.department_id && roles.length === 0 ? (
              <p className="text-xs text-muted-foreground">This company has no roles yet.</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Full name *</Label>
            <Input
              value={values.display_name}
              maxLength={120}
              onChange={(e) => set("display_name", e.target.value)}
              placeholder="Aarav Sharma"
            />
          </div>

          <div className="space-y-2">
            <Label>Username *</Label>
            <Input
              value={values.username}
              maxLength={60}
              onChange={(e) => set("username", e.target.value.trim())}
              placeholder="aarav.sharma"
            />
          </div>

          <div className="space-y-2">
            <Label>Email *</Label>
            <Input
              type="email"
              value={values.email}
              maxLength={255}
              onChange={(e) => set("email", e.target.value.trim())}
              placeholder="aarav@company.com"
            />
          </div>

          <div className="space-y-2">
            <Label>Mobile</Label>
            <Input
              value={values.mobile}
              maxLength={30}
              onChange={(e) => set("mobile", e.target.value)}
              placeholder="+91 90000 00000"
            />
          </div>

          <div className="space-y-2">
            <Label>Reporting manager</Label>
            <Select
              value={values.reporting_manager_id ?? NONE}
              onValueChange={(v) => set("reporting_manager_id", v === NONE ? null : v)}
              disabled={!values.company_id}
            >
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE}>None</SelectItem>
                {managers
                  .filter((m) => m.id !== user?.id)
                  .map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.display_name ?? m.username ?? "Unnamed"}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={values.status}
              onValueChange={(v) => set("status", v as "active" | "inactive")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!user ? (
            <div className="space-y-2 sm:col-span-2">
              <Label>Temporary password *</Label>
              <div className="flex gap-2">
                <Input
                  value={values.password ?? ""}
                  maxLength={72}
                  onChange={(e) => set("password", e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => set("password", generatePassword())}
                >
                  <KeyRound className="mr-2 h-4 w-4" />
                  Generate
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Shared once with the employee. Only a secure hash is stored by the auth service.
              </p>
            </div>
          ) : null}
        </div>

        {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {user ? "Save changes" : "Create user"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
