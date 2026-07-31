import { useEffect, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
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
import { COUNTRIES, TIMEZONES, fileToResizedDataUrl } from "@/lib/company-options";
import type { CompanyRow } from "@/lib/companies.functions";

export interface CompanyFormValues {
  name: string;
  code: string;
  login_id: string;
  password: string;
  country: string;
  timezone: string;
  logo_url: string | null;
  status: "active" | "suspended";
  admin_name: string;
  admin_email: string;
}

const EMPTY: CompanyFormValues = {
  name: "",
  code: "",
  login_id: "",
  password: "",
  country: "India",
  timezone: "Asia/Kolkata",
  logo_url: null,
  status: "active",
  admin_name: "",
  admin_email: "",
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  company: CompanyRow | null;
  saving: boolean;
  onSubmit: (values: CompanyFormValues) => Promise<void> | void;
}

export function CompanyFormDialog({ open, onOpenChange, company, saving, onSubmit }: Props) {
  const [values, setValues] = useState<CompanyFormValues>(EMPTY);

  useEffect(() => {
    if (!open) return;
    setValues(
      company
        ? {
            name: company.name,
            code: company.code,
            login_id: company.login_id,
            password: "",
            country: company.country || "India",
            timezone: company.timezone || "UTC",
            logo_url: company.logo_url,
            status: company.status,
            admin_name: company.admin_name,
            admin_email: company.admin_email,
          }
        : EMPTY,
    );
  }, [open, company]);

  const set = <K extends keyof CompanyFormValues>(key: K, value: CompanyFormValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  async function handleLogo(file: File | undefined) {
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Logo must be smaller than 4MB");
      return;
    }
    try {
      set("logo_url", await fileToResizedDataUrl(file));
    } catch {
      toast.error("Could not read that image");
    }
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (values.name.trim().length < 2) return toast.error("Company name is too short");
    if (values.code.trim().length < 2) return toast.error("Company code is too short");
    if (!/^\S+@\S+\.\S+$/.test(values.login_id.trim()))
      return toast.error("Company login ID must be a valid email");
    if (!company && values.password.length < 8)
      return toast.error("Password must be at least 8 characters");
    if (company && values.password && values.password.length < 8)
      return toast.error("Password must be at least 8 characters");
    if (values.admin_email && !/^\S+@\S+\.\S+$/.test(values.admin_email.trim()))
      return toast.error("Company admin email is invalid");
    void onSubmit(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display">
            {company ? "Edit company" : "Add company"}
          </DialogTitle>
          <DialogDescription>
            {company
              ? "Update tenant details, credentials, and status."
              : "Create a tenant workspace and its company login credentials."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="name">Company name</Label>
            <Input
              id="name"
              value={values.name}
              maxLength={120}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Acme Technologies"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="code">Company code</Label>
            <Input
              id="code"
              value={values.code}
              maxLength={40}
              onChange={(e) => set("code", e.target.value.toUpperCase())}
              placeholder="ACME-01"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="login">Company login ID</Label>
            <Input
              id="login"
              type="email"
              autoComplete="off"
              value={values.login_id}
              maxLength={255}
              onChange={(e) => set("login_id", e.target.value)}
              placeholder="admin@acme.com"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">
              Company password {company ? <span className="text-muted-foreground">(optional)</span> : null}
            </Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={values.password}
              maxLength={72}
              onChange={(e) => set("password", e.target.value)}
              placeholder={company ? "Leave blank to keep current" : "Minimum 8 characters"}
            />
          </div>
          <div className="grid gap-2">
            <Label>Country</Label>
            <Select value={values.country} onValueChange={(v) => set("country", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Time zone</Label>
            <Select value={values.timezone} onValueChange={(v) => set("timezone", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select time zone" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="adminName">Company admin</Label>
            <Input
              id="adminName"
              value={values.admin_name}
              maxLength={120}
              onChange={(e) => set("admin_name", e.target.value)}
              placeholder="Full name"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="adminEmail">Admin email</Label>
            <Input
              id="adminEmail"
              type="email"
              value={values.admin_email}
              maxLength={255}
              onChange={(e) => set("admin_email", e.target.value)}
              placeholder="hr.lead@acme.com"
            />
          </div>
          <div className="grid gap-2">
            <Label>Status</Label>
            <Select
              value={values.status}
              onValueChange={(v) => set("status", v as "active" | "suspended")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="logo">Company logo</Label>
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-muted">
                {values.logo_url ? (
                  <img
                    src={values.logo_url}
                    alt={`${values.name || "Company"} logo preview`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Upload className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <Input
                id="logo"
                type="file"
                accept="image/*"
                className="cursor-pointer"
                onChange={(e) => void handleLogo(e.target.files?.[0])}
              />
            </div>
          </div>

          <DialogFooter className="sm:col-span-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {company ? "Save changes" : "Create company"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
