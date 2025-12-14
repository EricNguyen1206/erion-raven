import { useSignupMutation } from "@/services/api/auth";
import { Link, useNavigate } from "react-router-dom";
import { useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Label } from "@radix-ui/react-label";
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card";
import { Input } from "../ui/input";
import { Check, Loader2 } from "lucide-react";
import { validatePassword, validateEmail } from "@/lib/validators";

const RegisterForm = () => {
  const emailRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const [hasError, setHasError] = useState(false);

  // Use state for password fields to enable reactive validation
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Reactive validation checks based on state
  const hasMinLength = useMemo(() => password.length >= 6, [password]);
  const hasNumber = useMemo(() => /\d/.test(password), [password]);
  const hasAlphabet = useMemo(() => /[a-zA-Z]/.test(password), [password]);
  const hasConfirmPassword = useMemo(() => confirmPassword.length > 0 && confirmPassword === password, [confirmPassword, password]);

  const navigate = useNavigate();

  const signupMutation = useSignupMutation({
    onSuccess: () => {
      // Registration successful, redirect to login
      toast.success("Registration successful! Please sign in with your credentials.");
      navigate("/login");
    },
    onError: () => {
      setHasError(true);
      toast.error("An error occurred during registration");
      nameRef.current?.focus();
    },
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setHasError(false);

    const email = emailRef.current?.value || "";
    const username = nameRef.current?.value || "";

    // Validate required fields
    if (!email || !password || !confirmPassword || !username) {
      toast.error("Please fill in all required fields");
      setHasError(true);
      return;
    }

    // Validate username length
    if (username.length < 3) {
      toast.error("Username must be at least 3 characters");
      setHasError(true);
      nameRef.current?.focus();
      return;
    }

    // Validate email format
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      toast.error(emailValidation.error);
      setHasError(true);
      emailRef.current?.focus();
      return;
    }

    // Validate password strength (must contain letters and numbers)
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      toast.error(passwordValidation.error);
      setHasError(true);
      // Password input is controlled, focus handled by form
      return;
    }

    // Validate password match
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setHasError(true);
      // Confirm password input is controlled, focus handled by form
      return;
    }

    // Prepare registration data
    const registrationData = {
      email,
      password,
      username,
    };

    signupMutation.mutate(registrationData);
  };

  const isLoading = signupMutation.isPending;

  // Error styling for inputs
  const inputErrorClass = hasError
    ? "border-destructive focus:ring-destructive"
    : "border-primary";

  const handleInputFocus = () => {
    if (hasError) {
      setHasError(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-0 shadow-lg bg-card">
      <CardHeader className="space-y-3 pb-6">
        <CardTitle className="text-3xl font-light tracking-tight text-card-foreground">
          Create account
        </CardTitle>
        <CardDescription className="text-base leading-relaxed text-muted-foreground">
          Enter your information to get started
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className={`text-sm font-normal ${hasError ? "text-destructive" : "text-muted-foreground"}`}
            >
              Full name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              ref={nameRef}
              onFocus={handleInputFocus}
              className={`h-11 border rounded-sm text-foreground bg-input transition-colors ${inputErrorClass}`}
              required
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">Minimum 3 characters</p>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="email"
              className={`text-sm font-normal ${hasError ? "text-destructive" : "text-muted-foreground"}`}
            >
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              ref={emailRef}
              onFocus={handleInputFocus}
              className={`h-11 border rounded-sm text-foreground bg-input transition-colors ${inputErrorClass}`}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="password"
              className={`text-sm font-normal ${hasError ? "text-destructive" : "text-muted-foreground"}`}
            >
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={handleInputFocus}
              className={`h-11 border rounded-sm text-foreground bg-input transition-colors ${inputErrorClass}`}
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-1">
            <Label
              htmlFor="confirmPassword"
              className={`text-sm font-normal ${hasError ? "text-destructive" : "text-muted-foreground"}`}
            >
              Confirm password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onFocus={handleInputFocus}
              className={`h-11 border rounded-sm text-foreground bg-input transition-colors ${inputErrorClass}`}
              required
              disabled={isLoading}
            />

            <div className="space-y-2 pt-3">
              <div className="flex items-center gap-2">
                <div
                  className="flex h-4 w-4 items-center justify-center rounded-full border transition-all"
                  style={{
                    borderColor: hasMinLength ? "#f25042" : "#8c7851",
                    backgroundColor: hasMinLength ? "#f25042" : "transparent",
                  }}
                >
                  {hasMinLength && <Check className="h-3 w-3" style={{ color: "#fffffe" }} />}
                </div>
                <span className="text-xs font-light" style={{ color: hasMinLength ? "#020826" : "#716040" }}>
                  Password must have min length 6 characters
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className="flex h-4 w-4 items-center justify-center rounded-full border transition-all"
                  style={{
                    borderColor: hasNumber ? "#f25042" : "#8c7851",
                    backgroundColor: hasNumber ? "#f25042" : "transparent",
                  }}
                >
                  {hasNumber && <Check className="h-3 w-3" style={{ color: "#fffffe" }} />}
                </div>
                <span className="text-xs font-light" style={{ color: hasNumber ? "#020826" : "#716040" }}>
                  Password must contain number
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className="flex h-4 w-4 items-center justify-center rounded-full border transition-all"
                  style={{
                    borderColor: hasAlphabet ? "#f25042" : "#8c7851",
                    backgroundColor: hasAlphabet ? "#f25042" : "transparent",
                  }}
                >
                  {hasAlphabet && <Check className="h-3 w-3" style={{ color: "#fffffe" }} />}
                </div>
                <span className="text-xs font-light" style={{ color: hasAlphabet ? "#020826" : "#716040" }}>
                  Password must contain alphabet character
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div
                  className="flex h-4 w-4 items-center justify-center rounded-full border transition-all"
                  style={{
                    borderColor: hasConfirmPassword ? "#f25042" : "#8c7851",
                    backgroundColor: hasConfirmPassword ? "#f25042" : "transparent",
                  }}
                >
                  {hasConfirmPassword && <Check className="h-3 w-3" style={{ color: "#fffffe" }} />}
                </div>
                <span className="text-xs font-light" style={{ color: hasConfirmPassword ? "#020826" : "#716040" }}>
                  Confirm password must match
                </span>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 text-base font-normal mt-6 bg-accent text-accent-foreground hover:bg-accent/90 rounded-sm disabled:opacity-70"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center pt-2">
        <p className="text-sm text-muted-foreground">
          {"Already have an account? "}
          <Link to="/login" className="font-medium text-accent hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default RegisterForm;
