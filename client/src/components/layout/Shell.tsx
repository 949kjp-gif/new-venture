import { Link, useLocation } from "wouter";
import { LayoutDashboard, Calculator, FileText, Sparkles } from "lucide-react";

export function Shell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/builder", label: "Budget Builder", icon: Calculator },
    { href: "/quote-normalizer", label: "Quote Normalizer", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-background flex text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col">
        <div className="p-6">
          <Link href="/">
            <a className="flex items-center gap-2 font-serif text-2xl font-bold tracking-tight text-primary">
              <Sparkles className="w-6 h-6 text-accent" />
              WedAgent
            </a>
          </Link>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          {links.map((link) => {
            const active = location === link.href;
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <a className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
                  <Icon className="w-4 h-4" />
                  <span className="font-medium text-sm">{link.label}</span>
                </a>
              </Link>
            )
          })}
        </nav>
      </aside>
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <div className="md:hidden p-4 border-b border-border bg-card flex justify-between items-center">
           <Link href="/">
            <a className="flex items-center gap-2 font-serif text-xl font-bold tracking-tight text-primary">
              <Sparkles className="w-5 h-5 text-accent" />
              WedAgent
            </a>
          </Link>
          <div className="flex gap-4 text-sm font-medium text-muted-foreground">
             <Link href="/dashboard"><a className={location === '/dashboard' ? 'text-primary' : ''}>Menu</a></Link>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}
