import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Link, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Schedule from "./pages/Schedule";
import History from "./pages/History";
import Settings from "./pages/Settings";
import Pdfs from "./pages/Pdfs";
import { Zap, Calendar, History as HistoryIcon, Settings as SettingsIcon, FileText } from "lucide-react";

function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { path: "/", label: "Consultar", icon: Zap, gradient: "from-violet-500 to-blue-500" },
    { path: "/schedule", label: "Agendar", icon: Calendar, gradient: "from-blue-500 to-cyan-500" },
    { path: "/pdfs", label: "PDFs", icon: FileText, gradient: "from-purple-500 to-pink-500" },
    { path: "/history", label: "Histórico", icon: HistoryIcon, gradient: "from-orange-500 to-red-500" },
    { path: "/settings", label: "Configurações", icon: SettingsIcon, gradient: "from-slate-500 to-slate-600" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:top-0 md:bottom-auto md:sticky">
      <div className="glass border-t md:border-t-0 md:border-b border-white/10 backdrop-blur-xl">
        <div className="container">
          <div className="flex items-center justify-around md:justify-start md:gap-1 py-3 md:py-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`
                    group relative flex flex-col md:flex-row items-center gap-1.5 md:gap-2 
                    px-4 md:px-6 py-2 md:py-2.5 rounded-xl md:rounded-lg
                    transition-all duration-300 ease-out
                    ${isActive
                      ? `bg-gradient-to-r ${item.gradient} text-white shadow-lg scale-105`
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 md:w-4 md:h-4 transition-all duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                  <span className="text-xs md:text-sm font-medium">{item.label}</span>
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full md:hidden" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

function Router() {
  return (
    <>
      <Navigation />
      <div className="pb-20 md:pb-0 md:pt-20 min-h-screen">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/schedule" component={Schedule} />
          <Route path="/pdfs" component={Pdfs} />
          <Route path="/history" component={History} />
          <Route path="/settings" component={Settings} />
          <Route path="/404" component={NotFound} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster 
            position="top-right"
            toastOptions={{
              className: "glass border border-white/10",
              style: {
                background: "rgba(30, 41, 59, 0.9)",
                backdropFilter: "blur(12px)",
              }
            }}
          />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
