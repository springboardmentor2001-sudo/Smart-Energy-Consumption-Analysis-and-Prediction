import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { LogIn, Zap, ArrowRight, ShieldCheck, Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginValues) => {
    setIsLoading(true);
    setTimeout(() => {
      localStorage.setItem("user_auth", JSON.stringify({
        username: values.username,
        loginTime: new Date().toISOString(),
      }));
      
      toast({
        title: "Welcome Back",
        description: `Successfully signed in as ${values.username}`,
      });
      setLocation("/");
      setIsLoading(false);
    }, 1200);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-slate-950">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 -right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 -left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50 contrast-150" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="border-white/10 bg-black/40 backdrop-blur-2xl shadow-2xl overflow-hidden no-default-hover-elevate">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue-500 to-primary animate-shimmer" />
          
          <CardHeader className="space-y-4 pb-4">
            <div className="flex justify-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-primary/50 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative p-4 rounded-2xl bg-primary/10 border border-primary/20">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
              </div>
            </div>
            <div className="text-center space-y-2">
              <CardTitle className="text-3xl font-bold tracking-tight bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
                Welcome Back
              </CardTitle>
              <CardDescription className="text-slate-400 text-base">
                Sign in to your energy intelligence portal
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Username</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your username" 
                          {...field} 
                          className="bg-white/5 border-white/20 focus:border-primary/50 text-white placeholder:text-slate-500 transition-colors"
                          data-testid="input-username" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-slate-300">Password</FormLabel>
                        <button type="button" className="text-xs text-primary hover:underline transition-all">Forgot password?</button>
                      </div>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          {...field} 
                          className="bg-white/5 border-white/20 focus:border-primary/50 text-white placeholder:text-slate-500 transition-colors"
                          data-testid="input-password" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="pt-2">
                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95" 
                    disabled={isLoading}
                    data-testid="button-login"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Signing in...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Sign In <ArrowRight className="w-4 h-4" />
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex flex-col space-y-6 pt-2 pb-8">
            <div className="flex items-center gap-4 w-full">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Secure Access</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <div className="flex justify-center gap-6">
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <ShieldCheck className="w-4 h-4 text-green-500" />
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>AI Insights</span>
              </div>
            </div>

            <p className="text-slate-400 text-sm">
              Don't have an account?{" "}
              <Link href="/signup" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                Sign up here
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
