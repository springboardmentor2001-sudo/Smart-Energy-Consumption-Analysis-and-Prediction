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
import { UserPlus, Zap, ArrowRight, ShieldCheck, Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupValues = z.infer<typeof signupSchema>;

export default function Signup() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: SignupValues) => {
    setIsLoading(true);
    setTimeout(() => {
      localStorage.setItem("user_auth", JSON.stringify({
        username: values.username,
        email: values.email,
        loginTime: new Date().toISOString(),
      }));
      
      toast({
        title: "Account Created",
        description: `Welcome to SmartEnergy, ${values.username}!`,
      });
      setLocation("/");
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-slate-950">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-50 contrast-150" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-lg"
      >
        <Card className="border-white/10 bg-black/40 backdrop-blur-2xl shadow-2xl overflow-hidden no-default-hover-elevate">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue-500 to-primary animate-shimmer" />
          
          <CardHeader className="space-y-4 pb-4">
            <div className="flex justify-center">
              <div className="relative group">
                <div className="absolute inset-0 bg-primary/50 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative p-4 rounded-2xl bg-primary/10 border border-primary/20">
                  <UserPlus className="w-8 h-8 text-primary" />
                </div>
              </div>
            </div>
            <div className="text-center space-y-2">
              <CardTitle className="text-3xl font-bold tracking-tight bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent">
                Join SmartEnergy
              </CardTitle>
              <CardDescription className="text-slate-400 text-base">
                Take control of your energy future today
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Username</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="johndoe" 
                            {...field} 
                            className="bg-white/5 border-white/20 focus:border-primary/50 text-white placeholder:text-slate-500 transition-colors"
                            data-testid="input-signup-username" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300">Email</FormLabel>
                        <FormControl>
                          <Input 
                            type="email" 
                            placeholder="name@example.com" 
                            {...field} 
                            className="bg-white/5 border-white/20 focus:border-primary/50 text-white placeholder:text-slate-500 transition-colors"
                            data-testid="input-signup-email" 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          {...field} 
                          className="bg-white/5 border-white/20 focus:border-primary/50 text-white placeholder:text-slate-500 transition-colors"
                          data-testid="input-signup-password" 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Confirm Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          {...field} 
                          className="bg-white/5 border-white/20 focus:border-primary/50 text-white placeholder:text-slate-500 transition-colors"
                          data-testid="input-signup-confirm-password" 
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
                    data-testid="button-signup-submit"
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating account...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Get Started <ArrowRight className="w-4 h-4" />
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
                <span>AI Powered</span>
              </div>
            </div>

            <p className="text-slate-400 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:text-primary/80 font-semibold transition-colors">
                Sign in here
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
