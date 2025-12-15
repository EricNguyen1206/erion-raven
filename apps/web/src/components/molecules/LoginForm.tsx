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

const LoginForm = () => {
  const [hasError, setHasError] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Get getProfile from auth store to update authentication state
  const getProfile = useAuthStore((state) => state.getProfile);

  const signinMutation = useSigninMutation({
    onSuccess: async () => {
      // Update the auth store by fetching the user profile
      // This sets isAuthenticated = true in the Zustand store
      await getProfile();

      // Invalidate and refetch user query to get fresh user data
      queryClient.invalidateQueries({ queryKey: ["user", "current"] });

      setHasError(false);
      toast.success("Sign in successfully");

      // Navigate after auth store is updated
      navigate("/");
    },
    onError: (_error) => {
      setHasError(true);
      toast.error("Invalid email or password. Please try again.");
      // Focus on email input when login fails
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

  // Clear error on input focus/change
  const handleInputFocus = () => {
    if (hasError) {
      setHasError(false);
    }
  };

  const isLoading = signinMutation.isPending;

  // Error styling for inputs
  const inputErrorClass = hasError
    ? "border-destructive focus:ring-destructive"
    : "border-primary";

  return (
    <Card className="w-full max-w-md border-0 shadow-lg bg-card">
      <CardHeader className="space-y-3 pb-6">
        <CardTitle className="text-3xl font-light tracking-tight text-card-foreground">
          Welcome back
        </CardTitle>
        <CardDescription className="text-base leading-relaxed text-muted-foreground">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className={`text-sm font-normal ${hasError ? "text-destructive" : "text-muted-foreground"}`}
            >
              Email
            </Label>
            <Input
              ref={emailRef}
              id="email"
              type="email"
              placeholder="name@example.com"
              defaultValue="user1@example.com"
              onFocus={handleInputFocus}
              className={`h-11 border rounded-sm text-foreground bg-input transition-colors ${inputErrorClass}`}
              required
              disabled={isLoading}
              aria-invalid={hasError}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="password"
                className={`text-sm font-normal ${hasError ? "text-destructive" : "text-muted-foreground"}`}
              >
                Password
              </Label>
              <Link to="/forgot-password" className="text-sm text-accent hover:underline">
                Forgot password?
              </Link>
            </div>
            <Input
              ref={passwordRef}
              id="password"
              type="password"
              defaultValue="admin123"
              onFocus={handleInputFocus}
              className={`h-11 border rounded-sm text-foreground bg-input transition-colors ${inputErrorClass}`}
              required
              disabled={isLoading}
              aria-invalid={hasError}
            />
          </div>

          <Button
            type="submit"
            className="w-full h-11 text-base font-normal mt-6 bg-accent text-accent-foreground hover:bg-accent/90 rounded-sm disabled:opacity-70"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center pt-2">
        <p className="text-sm text-muted-foreground">
          {"Don't have an account? "}
          <Link to="/register" className="font-medium text-accent hover:underline">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
