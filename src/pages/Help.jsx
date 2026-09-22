import React from "react";
import { Link } from "react-router-dom";
import { APP_NAME } from "@/lib/constants";
import { ShieldCheck, Download, RotateCcw, Database, Lock, ChevronRight } from "lucide-react";

// NAV-02: Help page — data stays on device, how to back up & restore.
// SEC-07: privacy statement.
export default function Help() {
  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl font-semibold tracking-tight">Help & Privacy</h1>
      <p className="mt-2 text-muted-foreground">Everything you need to know about how {APP_NAME} handles your data.</p>

      <div className="mt-8 space-y-5">
        <Card icon={Lock} title="Your data stays on this device">
          {APP_NAME} stores all your transactions, categories, and settings in your browser only. Nothing is sent to a
          server, and the company cannot see your data. Data is kept separately for each account, so two people using the
          same browser never see each other's records.
        </Card>

        <Card icon={Database} title="It lives in one browser">
          Because data is stored locally, clearing your browser's site data or switching devices will remove it. There is
          no cloud copy and no cross-device sync. That is why backups matter.
        </Card>

        <Card icon={Download} title="Back up your data">
          Go to <Link to="/settings" className="font-medium text-primary underline-offset-2 hover:underline">Settings</Link> and choose
          {" "}<b>Back up my data</b>. You'll get a JSON file with all your transactions, custom categories, and display
          currency. Keep it somewhere safe — it is not encrypted.
        </Card>

        <Card icon={RotateCcw} title="Restore from a backup">
          In Settings, choose <b>Restore</b> and pick a backup file. Restore <i>merges</i> into your current data — it
          never replaces it. Transactions that already exist are skipped; if a transaction was deleted after the backup
          was made, restoring will bring it back.
        </Card>

        <Card icon={ShieldCheck} title="No financial advice">
          {APP_NAME} is a simple record-keeping tool. It does not provide financial, investment, or tax advice. The
          figures shown are calculated from the transactions you enter.
        </Card>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-5">
        <h3 className="font-display text-lg font-semibold">Quick links</h3>
        <div className="mt-3 divide-y divide-border/60">
          {[
            { to: "/add", label: "Add a transaction" },
            { to: "/transactions", label: "View & filter transactions" },
            { to: "/reports", label: "See your reports" },
            { to: "/settings", label: "Back up or reset your data" },
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