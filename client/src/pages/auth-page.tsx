import { useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const authSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthForm = z.infer<typeof authSchema>;

function LoginForm() {
  const { loginMutation } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthForm>({ resolver: zodResolver(authSchema) });

  const onSubmit = (data: AuthForm) => {
    loginMutation.mutate(data, {
      onSuccess: () => setLocation("/home"),
      onError: (err) =>
        toast({ title: "Login failed", description: err.message, variant: "destructive" }),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to your WedAgent account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="login-username">Username</Label>
            <Input id="login-username" {...register("username")} autoComplete="username" />
            {errors.username && (
              <p className="text-xs text-destructive">{errors.username.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              type="password"
              {...register("password")}
              autoComplete="current-password"
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
            {loginMutation.isPending ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function RegisterForm() {
  const { registerMutation } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthForm>({ resolver: zodResolver(authSchema) });

  const onSubmit = (data: AuthForm) => {
    registerMutation.mutate(data, {
      onSuccess: () => setLocation("/home"),
      onError: (err) =>
        toast({ title: "Registration failed", description: err.message, variant: "destructive" }),
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>Start planning your perfect wedding</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="reg-username">Username</Label>
            <Input id="reg-username" {...register("username")} autoComplete="username" />
            {errors.username && (
              <p className="text-xs text-destructive">{errors.username.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="reg-password">Password</Label>
            <Input
              id="reg-password"
              type="password"
              {...register("password")}
              autoComplete="new-password"
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
            {registerMutation.isPending ? "Creating account…" : "Create account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && user) {
      setLocation("/home");
    }
  }, [user, isLoading, setLocation]);

  if (isLoading || user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Sparkles className="w-6 h-6 text-accent" />
          <span className="font-serif text-3xl font-bold tracking-tight text-primary">
            WedAgent
          </span>
        </div>
        <Tabs defaultValue="login">
          <TabsList className="w-full mb-2">
            <TabsTrigger value="login" className="flex-1">
              Login
            </TabsTrigger>
            <TabsTrigger value="register" className="flex-1">
              Register
            </TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm />
          </TabsContent>
          <TabsContent value="register">
            <RegisterForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
