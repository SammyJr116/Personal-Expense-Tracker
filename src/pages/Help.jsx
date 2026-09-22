import React from "react";
import { Link } from "react-router-dom";
import { APP_NAME } from "@/lib/constants";
import { STRINGS } from "@/lib/strings";
import { ShieldCheck, Download, RotateCcw, Database, Lock, ChevronRight } from "lucide-react";

// NAV-02: Help page — data stays on device, how to back up & restore.
// SEC-07: privacy statement.
export default function Help() {
  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl font-semibold tracking-tight">{STRINGS.help.title}</h1>
      <p className="mt-2 text-muted-foreground">{STRINGS.help.subtitle(APP_NAME)}</p>

      <div className="mt-8 space-y-5">
        <Card icon={Lock} title={STRINGS.help.deviceTitle}>
          {STRINGS.help.deviceBody.replaceAll("{APP_NAME}", APP_NAME)}
        </Card>

        <Card icon={Database} title={STRINGS.help.browserTitle}>
          {STRINGS.help.browserBody}
        </Card>

        <Card icon={Download} title={STRINGS.help.backupTitle}>
          Go to <Link to="/settings" className="font-medium text-primary underline-offset-2 hover:underline">{STRINGS.settings.title}</Link> and choose
          {" "}<b>{STRINGS.help.backUpBold}</b>. You'll get a JSON file with all your transactions, custom categories, and display
          currency. Keep it somewhere safe — it is not encrypted.
        </Card>

        <Card icon={RotateCcw} title={STRINGS.help.restoreTitle}>
          In {STRINGS.settings.title}, choose <b>{STRINGS.help.restoreBold}</b> and pick a backup file. Restore <i>merges</i> into your current data — it
          never replaces it. Transactions that already exist are skipped; if a transaction was deleted after the backup
          was made, restoring will bring it back.
        </Card>

        <Card icon={ShieldCheck} title={STRINGS.help.adviceTitle}>
          {STRINGS.help.adviceBody.replaceAll("{APP_NAME}", APP_NAME)}
        </Card>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-5">
        <h3 className="font-display text-lg font-semibold">{STRINGS.help.quickLinks}</h3>
        <div className="mt-3 divide-y divide-border/60">
          {[
            { to: "/add", label: STRINGS.help.linkAdd },
            { to: "/transactions", label: STRINGS.help.linkTransactions },
            { to: "/reports", label: STRINGS.help.linkReports },
            { to: "/settings", label: STRINGS.help.linkSettings },
          ].map((l) => (
            <Link key={l.to} to={l.to} className="flex items-center justify-between py-3 text-sm hover:text-primary">
              <span>{l.label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function Card({ icon: Icon, title, children }) {
  return (
    <div className="card-soft p-5">
      <div className="flex items-center gap-2.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="font-display text-lg font-semibold">{title}</h2>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}