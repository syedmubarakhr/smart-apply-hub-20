import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEPARTMENT_SUGGESTIONS, type DepartmentRow } from "@/lib/departments.shared";

export interface DepartmentFormValues {
  company_id: string;
  name: string;
  code: string;
  description: string;
  status: "active" | "inactive";
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department: DepartmentRow | null;
  companies: { id: string; name: string; code: string }[];
  defaultCompanyId?: string;
  saving: boolean;
  onSubmit: (values: DepartmentFormValues) => Promise<void>;
}

const EMPTY: DepartmentFormValues = {
  company_id: "",
  name: "",
  code: "",
  description: "",
  status: "active",
};

export function DepartmentFormDialog({
  open,
  onOpenChange,
  department,
  companies,
  defaultCompanyId,
  saving,
  onSubmit,
}: Props) {
  const [values, setValues] = useState<DepartmentFormValues>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setValues(
      department
        ? {
            company_id: department.company_id,
            name: department.name,
            code: department.code,
            description: department.description,
            status: department.status,
          }
        : { ...EMPTY, company_id: defaultCompanyId ?? "" },
    );
  }, [open, department, defaultCompanyId]);

  function set<K extends keyof DepartmentFormValues>(key: K, value: DepartmentFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!values.company_id) {
      setError("Select the company this department belongs to.");
      return;
    }
    if (values.name.trim().length < 2) {
      setError("Department name must be at least 2 characters.");
      return;
    }
    setError(null);
    await onSubmit({ ...values, name: values.name.trim(), code: values.code.trim() });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{department ? "Edit department" : "Create department"}</DialogTitle>
          <DialogDescription>
            Departments are linked to a company. Add as many as you need.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="dept-company">Company</Label>
            <Select value={values.company_id} onValueChange={(v) => set("company_id", v)}>
              <SelectTrigger id="dept-company">
                <SelectValue placeholder="Select a company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} {c.code ? `(${c.code})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {companies.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Create a company first — departments must belong to one.
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dept-name">Department name</Label>
              <Input
                id="dept-name"
                value={values.name}
                maxLength={120}
                placeholder="Recruitment"
                onChange={(e) => set("name", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dept-code">Department code</Label>
              <Input
                id="dept-code"
                value={values.code}
                maxLength={40}
                placeholder="REC"
                onChange={(e) => set("code", e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {DEPARTMENT_SUGGESTIONS.map((s) => (
              <Button
                key={s}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => set("name", s)}
              >
                {s}
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dept-description">Description</Label>
            <Textarea
              id="dept-description"
              value={values.description}
              maxLength={500}
              rows={3}
              placeholder="What this department is responsible for"
              onChange={(e) => set("description", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dept-status">Status</Label>
            <Select
              value={values.status}
              onValueChange={(v) => set("status", v as "active" | "inactive")}
            >
              <SelectTrigger id="dept-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {department ? "Save changes" : "Create department"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
