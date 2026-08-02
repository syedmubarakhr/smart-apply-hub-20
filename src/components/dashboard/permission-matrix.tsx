import { Fragment } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  PERMISSION_ACTIONS,
  PERMISSION_MODULES,
  type PermissionAction,
  type RolePermissionRow,
} from "@/lib/roles.shared";

interface PermissionMatrixProps {
  value: Record<string, RolePermissionRow>;
  onChange: (next: Record<string, RolePermissionRow>) => void;
  disabled?: boolean;
}

const GROUPS = Array.from(new Set(PERMISSION_MODULES.map((m) => m.group)));

export function PermissionMatrix({ value, onChange, disabled }: PermissionMatrixProps) {
  function setCell(moduleKey: string, action: PermissionAction, checked: boolean) {
    const current =
      value[moduleKey] ??
      ({
        module: moduleKey,
        can_view: false,
        can_add: false,
        can_edit: false,
        can_delete: false,
        can_approve: false,
        can_export: false,
      } satisfies RolePermissionRow);
    const next: RolePermissionRow = { ...current, [action]: checked };
    // Any write/approve/export capability implies view access.
    if (checked && action !== "can_view") next.can_view = true;
    if (!checked && action === "can_view") {
      next.can_add = false;
      next.can_edit = false;
      next.can_delete = false;
      next.can_approve = false;
      next.can_export = false;
    }
    onChange({ ...value, [moduleKey]: next });
  }

  function setRow(moduleKey: string, checked: boolean) {
    onChange({
      ...value,
      [moduleKey]: {
        module: moduleKey,
        can_view: checked,
        can_add: checked,
        can_edit: checked,
        can_delete: checked,
        can_approve: checked,
        can_export: checked,
      },
    });
  }

  function setColumn(action: PermissionAction, checked: boolean) {
    const next = { ...value };
    for (const m of PERMISSION_MODULES) {
      const current = next[m.key];
      const row: RolePermissionRow = current
        ? { ...current, [action]: checked }
        : {
            module: m.key,
            can_view: false,
            can_add: false,
            can_edit: false,
            can_delete: false,
            can_approve: false,
            can_export: false,
            [action]: checked,
          };
      if (checked && action !== "can_view") row.can_view = true;
      if (!checked && action === "can_view") {
        row.can_add = false;
        row.can_edit = false;
        row.can_delete = false;
        row.can_approve = false;
        row.can_export = false;
      }
      next[m.key] = row;
    }
    onChange(next);
  }

  const columnAll = (action: PermissionAction) =>
    PERMISSION_MODULES.every((m) => value[m.key]?.[action]);

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="sticky left-0 z-10 bg-muted/50 px-4 py-3 text-left font-medium text-foreground">
              Module
            </th>
            {PERMISSION_ACTIONS.map((a) => (
              <th key={a.key} className="px-2 py-3 text-center font-medium text-foreground">
                <span className="block">{a.label}</span>
                <button
                  type="button"
                  disabled={disabled}
                  className="mt-1 text-[11px] font-normal text-primary hover:underline disabled:opacity-50"
                  onClick={() => setColumn(a.key, !columnAll(a.key))}
                >
                  {columnAll(a.key) ? "clear" : "all"}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {GROUPS.map((group) => (
            <Fragment key={group}>
              <tr className="bg-muted/25">
                <td
                  colSpan={PERMISSION_ACTIONS.length + 1}
                  className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  {group}
                </td>
              </tr>
              {PERMISSION_MODULES.filter((m) => m.group === group).map((m) => {
                const row = value[m.key];
                const rowAll = PERMISSION_ACTIONS.every((a) => row?.[a.key]);
                return (
                  <tr key={m.key} className="border-t border-border">
                    <td className="sticky left-0 z-10 bg-card px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{m.label}</span>
                        <button
                          type="button"
                          disabled={disabled}
                          className="text-[11px] text-primary hover:underline disabled:opacity-50"
                          onClick={() => setRow(m.key, !rowAll)}
                        >
                          {rowAll ? "clear" : "all"}
                        </button>
                      </div>
                    </td>
                    {PERMISSION_ACTIONS.map((a) => (
                      <td key={a.key} className={cn("px-2 py-2.5 text-center")}>
                        <Checkbox
                          checked={!!row?.[a.key]}
                          disabled={disabled}
                          aria-label={`${a.label} ${m.label}`}
                          onCheckedChange={(checked) => setCell(m.key, a.key, checked === true)}
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
