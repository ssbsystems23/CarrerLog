import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  PlusCircle,
  List,
  Award,
  BookOpen,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/experiences", icon: Briefcase, label: "Experience" },
  { to: "/problems/new", icon: PlusCircle, label: "Log Problem" },
  { to: "/problems", icon: List, label: "Problems" },
  { to: "/certifications", icon: Award, label: "Certifications" },
  { to: "/learnings", icon: BookOpen, label: "Learnings" },
  { to: "/interview-bank", icon: MessageSquare, label: "Interview Bank" },
];

interface SidebarProps {
  onNavigate?: () => void;
}

function SidebarContent({ onNavigate }: SidebarProps) {
  return (
    <nav className="flex-1 space-y-1 p-4">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === "/" || item.to === "/problems"}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )
          }
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-64 md:flex-col border-r border-border bg-card">
      <Link to="/" className="flex h-16 items-center gap-2 border-b border-border px-6">
        <LayoutDashboard className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold">CarrerLog</span>
      </Link>
      <SidebarContent />
    </aside>
  );
}

export { SidebarContent, navItems };
