import { useSigninMutation } from "@/services/api/auth";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { toast } from "react-toastify";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import GithubLoginButton from "../atoms/GithubLoginButton";

const LoginForm = () => {
  const [hasError, setHasError] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const getProfile = useAuthStore((state) => state.getProfile);

  const signinMutation = useSigninMutation({
    onSuccess: async () => {
      await getProfile();
      queryClient.invalidateQueries({ queryKey: ["user", "current"] });
      setHasError(false);
      toast.success("Sign in successfully");
      navigate("/");
    },
    onError: (_error) => {
      setHasError(true);
      toast.error("Invalid email or password. Please try again.");
      emailRef.current?.focus();
      emailRef.current?.select();
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setHasError(false);
    const email = emailRef.current?.value || "";
    const password = passwordRef.current?.value || "";
    signinMutation.mutate({ email, password });
  };

  const handleInputFocus = () => {
    if (hasError) {
      setHasError(false);
    }
  };

  const handleGoogleLogin = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';
    window.location.href = `${apiUrl}/auth/google`;
  };

  const isLoading = signinMutation.isPending;

  const inputErrorClass = hasError
    ? "border-destructive/40 focus-visible:border-destructive/60"
    : "border-border/30 focus-visible:border-primary/40";

  return (
    <Card className="w-full max-w-md border-none shadow-none bg-card/50 backdrop-blur-sm">
      <CardHeader className="space-y-4 pb-8">
        <CardTitle className="text-3xl font-light tracking-wide text-foreground">
          Welcome back
        </CardTitle>
        <CardDescription className="text-sm font-light leading-relaxed text-muted-foreground/60 tracking-wide">
          Enter your credentials to continue
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className={`text-xs font-light tracking-wide uppercase ${hasError ? "text-destructive/70" : "text-muted-foreground/60"}`}
            >
              Email
            </Label>
            <Input
              ref={emailRef}
              id="email"
              type="email"
              placeholder="name@example.com"
              onFocus={handleInputFocus}
              className={`h-11 rounded-lg text-sm font-light bg-background/50 transition-all duration-200 ${inputErrorClass}`}
              required
              disabled={isLoading}
              aria-invalid={hasError}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="password"
                className={`text-xs font-light tracking-wide uppercase ${hasError ? "text-destructive/70" : "text-muted-foreground/60"}`}
              >
                Password
              </Label>
              <Link to="/forgot-password" className="text-xs font-light text-accent/70 hover:text-accent transition-colors tracking-wide">
                Forgot?
              </Link>
            </div>
            <Input
              ref={passwordRef}
              id="password"
              type="password"
              onFocus={handleInputFocus}
              className={`h-11 rounded-lg text-sm font-light bg-background/50 transition-all duration-200 ${inputErrorClass}`}
              required
              disabled={isLoading}
              aria-invalid={hasError}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 text-sm font-light tracking-wide mt-8 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg disabled:opacity-40 transition-all duration-200 shadow-none"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin opacity-60" />
                Signing in
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/30" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground/60">
              Or continue with
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-4">
          <button
            onClick={handleGoogleLogin}
            type="button"
            className="bg-white text-black font-bold rounded-md px-6 py-2 w-[100%] flex items-center justify-center gap-3 hover:bg-gray-100 transition-colors border border-gray-300"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
              </g>
            </svg>
            <span>Sign in with Google</span>
          </button>
          <GithubLoginButton />
        </div>
      </CardContent>

      <CardFooter className="flex justify-center pt-6">
        <p className="text-xs font-light text-muted-foreground/60 tracking-wide">
          {"Don't have an account? "}
          <Link to="/register" className="text-accent/80 hover:text-accent transition-colors">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
