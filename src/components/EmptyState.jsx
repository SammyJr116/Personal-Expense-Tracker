import React from "react";
import { Button } from "@/components/ui/button";

// ONB-02: useful empty states across the app.
export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction, compact }) {
  return (
    <div className={compact ? "py-8" : "py-14"}>
      <div className="mx-auto flex max-w-sm flex-col items-center text-center">
        {Icon && (
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
            <Icon className="h-7 w-7" />
          </div>
        )}
        <h3 className="font-display text-lg font-semibold">{title}</h3>
        {description && (
          <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
        )}
        {actionLabel && (
          <Button onClick={onAction} className="mt-5" size="sm">
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}