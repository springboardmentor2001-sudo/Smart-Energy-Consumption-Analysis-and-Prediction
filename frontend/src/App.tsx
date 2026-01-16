import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Header } from "@/components/layout/Header";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useEnergyStore } from "@/lib/store";
import { useEffect, Suspense, lazy, useState } from "react";
import { Loader2 } from "lucide-react";

const Home = lazy(() => import("@/pages/Home"));
const Forecast = lazy(() => import("@/pages/Forecast"));
const Chatbot = lazy(() => import("@/pages/Chatbot"));
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const LiveEnergyWeather = lazy(() => import("@/pages/LiveEnergyWeather"));
const UploadPredict = lazy(() => import("@/pages/UploadPredict"));
const SpeechInput = lazy(() => import("@/pages/SpeechInput"));
const Reviews = lazy(() => import("@/pages/Reviews"));
const About = lazy(() => import("@/pages/About"));
const Login = lazy(() => import("@/pages/Login"));
const Signup = lazy(() => import("@/pages/Signup"));
const NotFound = lazy(() => import("@/pages/not-found"));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-muted-foreground">Loading...</span>
      </div>
    </div>
  );
}

function ProtectedRoute({ component: Component, path }: { component: any, path: string }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const authData = localStorage.getItem("user_auth");
    setIsAuthenticated(!!authData);
  }, []);

  if (isAuthenticated === null) return <PageLoader />;

  return (
    <Route path={path}>
      {isAuthenticated ? <Component /> : <Redirect to="/login" />}
    </Route>
  );
}

function Router() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <ProtectedRoute path="/" component={Home} />
        <ProtectedRoute path="/forecast" component={Forecast} />
        <ProtectedRoute path="/chatbot" component={Chatbot} />
        <ProtectedRoute path="/dashboard" component={Dashboard} />
        <ProtectedRoute path="/live-insights" component={LiveEnergyWeather} />
        <ProtectedRoute path="/upload-predict" component={UploadPredict} />
        <ProtectedRoute path="/speech-input" component={SpeechInput} />
        <ProtectedRoute path="/reviews" component={Reviews} />
        <ProtectedRoute path="/about" component={About} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  const { theme } = useEnergyStore();

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen bg-background text-foreground">
            <Header />
            <main>
              <Router />
            </main>
          </div>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
