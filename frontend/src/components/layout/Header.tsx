import { Link, useLocation } from "wouter";
import { Zap, Menu, X, Sun, Moon, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEnergyStore } from "@/lib/store";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/forecast", label: "Future Forecast" },
  { href: "/chatbot", label: "AI Chat" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/upload-predict", label: "Upload & Predict" },
  { href: "/live-insights", label: "Live Insights" },
  { href: "/reviews", label: "Reviews" },
  { href: "/about", label: "About" },
];

export function Header() {
  const [location, setLocation] = useLocation();
  const { theme, toggleTheme } = useEnergyStore();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<{ username: string } | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    
    // Check auth status on mount and location change
    const authData = localStorage.getItem("user_auth");
    if (authData) {
      try {
        setUser(JSON.parse(authData));
      } catch (e) {
        localStorage.removeItem("user_auth");
      }
    } else {
      setUser(null);
    }

    return () => window.removeEventListener("scroll", handleScroll);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("user_auth");
    setUser(null);
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    setLocation("/login");
  };

  const isAuthPage = location === "/login" || location === "/signup";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-lg border-b border-border shadow-lg"
          : "bg-transparent"
      }`}
      data-testid="header"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link href="/" className="flex items-center gap-2 group" data-testid="link-logo">
            <div className="relative">
              <Zap className="w-8 h-8 text-primary transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 bg-primary/30 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="text-xl font-bold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
              SmartEnergy
            </span>
          </Link>

          {!isAuthPage && (
            <nav className="hidden xl:flex items-center gap-1" data-testid="nav-desktop">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`relative ${
                      location === link.href
                        ? "text-primary"
                        : "text-muted-foreground"
                    }`}
                    data-testid={`link-nav-${link.label.toLowerCase().replace(" ", "-")}`}
                  >
                    {link.label}
                    {location === link.href && (
                      <motion.div
                        layoutId="nav-underline"
                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Button>
                </Link>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-2">
            {!isAuthPage && user ? (
              <div className="hidden md:flex items-center gap-2 mr-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {user.username}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleLogout}
                  title="Logout"
                  data-testid="button-logout"
                >
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            ) : !isAuthPage && (
              <Link href="/login">
                <Button variant="ghost" size="sm" className="hidden md:flex gap-2">
                  <User className="w-4 h-4" />
                  Login
                </Button>
              </Link>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              data-testid="button-theme-toggle"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            {!isAuthPage && (
              <Button
                variant="ghost"
                size="icon"
                className="xl:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
                data-testid="button-mobile-menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {!isAuthPage && mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="xl:hidden bg-background/95 backdrop-blur-lg border-b border-border"
            data-testid="nav-mobile"
          >
            <nav className="flex flex-col p-4 gap-1">
              {user && (
                <div className="flex items-center justify-between px-3 py-2 mb-2 border-b">
                  <span className="font-medium">{user.username}</span>
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </div>
              )}
              {!user && (
                <Link href="/login">
                  <Button variant="ghost" className="w-full justify-start mb-2">
                    <User className="w-4 h-4 mr-2" />
                    Login
                  </Button>
                </Link>
              )}
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={location === link.href ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    data-testid={`link-mobile-${link.label.toLowerCase().replace(" ", "-")}`}
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
