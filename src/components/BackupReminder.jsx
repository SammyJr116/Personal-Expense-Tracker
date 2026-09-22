import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "@/lib/store";
import { STRINGS } from "@/lib/strings";
import { X, ShieldAlert } from "lucide-react";

// BAK-09: gentle reminder when 30+ days since last backup (or never backed up with data).
// Dismissable, returns after 7 days.
export default function BackupReminder() {
  const { transactions, settings, updateSettings } = useApp();
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const last = settings.lastBackupDate;
  const snooze = settings.backupSnooze;
  if (snooze && new Date(snooze) > new Date()) return null;

  const hasData = transactions.length > 0;
  let daysSince = Infinity;
  if (last) {
    daysSince = (Date.now() - new Date(last).getTime()) / 86400000;
  }

  const show = hasData && daysSince >= 30;
  if (!show) return null;

  const dismiss = () => {
    setDismissed(true);
    const snoozeDate = new Date();
    snoozeDate.setDate(snoozeDate.getDate() + 7);
    updateSettings({ backupSnooze: snoozeDate.toISOString() });
  };

  return (
    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3.5">
      <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
      <div className="flex-1 text-sm">
        <span className="font-medium text-foreground">
          {last ? STRINGS.backupReminder.overdue : STRINGS.backupReminder.never}
        </span>
        <span className="text-muted-foreground">{STRINGS.backupReminder.livesHere}</span>
        <Link to="/settings" className="font-medium text-accent underline-offset-2 hover:underline">
          {STRINGS.backupReminder.backUpNow}
        </Link>
      </div>
      <button onClick={dismiss} aria-label={STRINGS.backupReminder.dismiss} className="rounded-lg p-1.5 text-muted-foreground hover:bg-background">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}