import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { NAV_ITEMS, APP_NAME } from "@/lib/constants";
import { STRINGS } from "@/lib/strings";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";
import { LogOut, HelpCircle, Plus } from "lucide-react";

const ICONS = {
  LayoutDashboard: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>,
  PlusCircle: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg>,
  List: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>,
  BarChart3: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18M7 16V9M12 16v-5M17 16v-9"/></svg>,
  Settings: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
};

function NavItem({ item, active, onClick }) {
  const Icon = ICONS[item.icon];
  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[15px] font-medium transition-all duration-200",
        active
          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
          : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      {Icon && <Icon className="h-[18px] w-[18px]" />}
      <span>{item.label}</span>
    </Link>
  );
}

export default function Sidebar({ onNavigate }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useApp();
  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <aside className="flex h-full w-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="px-5 pt-7 pb-6">
        <Link to="/" onClick={onNavigate} className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M4 7h16M4 12h10M4 17h7"/></svg>
          </div>
          <div className="leading-tight">
            <div className="font-display text-xl font-semibold tracking-tight text-white">{APP_NAME}</div>
            <div className="text-[11px] text-sidebar-foreground/60">{STRINGS.sidebar.subtitle}</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.path} item={item} active={isActive(item.path)} onClick={onNavigate} />
        ))}
        <Link
          to="/help"
          onClick={onNavigate}
          className={cn(
            "group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-[15px] font-medium transition-all",
            isActive("/help") ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <HelpCircle className="h-[18px] w-[18px]" />
          <span>{STRINGS.sidebar.help}</span>
        </Link>
      </nav>

      <div className="px-3 pb-5">
        <Link
          to="/add"
          onClick={onNavigate}
          className="mb-3 flex items-center justify-center gap-2 rounded-xl bg-sidebar-primary px-3.5 py-2.5 text-[15px] font-semibold text-sidebar-primary-foreground shadow-sm transition hover:brightness-110"
        >
          <Plus className="h-4 w-4" /> {STRINGS.sidebar.newTransaction}
        </Link>

        <div className="rounded-xl border border-sidebar-border/60 bg-sidebar-accent/50 p-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sidebar-primary/30 text-sidebar-primary text-sm font-semibold">
              {(user?.name || "?").charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-white">{user?.name}</div>
              <div className="truncate text-[11px] text-sidebar-foreground/60">{user?.email}</div>
            </div>
            <button
              onClick={() => { signOut(); navigate("/"); }}
              className="rounded-lg p-2 text-sidebar-foreground/70 transition hover:bg-sidebar-accent hover:text-white"
              title={STRINGS.common.signOut}
              aria-label={STRINGS.common.signOut}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}