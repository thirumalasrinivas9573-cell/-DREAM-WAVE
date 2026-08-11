"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { AuthAlert } from "@/components/auth/auth-alert";
import { FormField, PasswordInput } from "@/components/forms";
import { useAuth } from "@/components/providers/auth-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { AUTH_ROUTES } from "@/constants/auth";
import { getPostAuthDestination } from "@/lib/auth/post-auth";
import { loginSchema, type LoginValues } from "@/lib/auth/schemas";
import { cn } from "@/lib/utils";
import type { AuthFormStatus } from "@/types/auth";

/**
 * Production login form wired to Dream Wave auth API.
 */
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [status, setStatus] = useState<AuthFormStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: true,
    },
  });

  const loading = status === "loading" || isSubmitting;

  const onSubmit = handleSubmit(async (values) => {
    setStatus("loading");
    setMessage(null);

    try {
      const user = await login(
        values.email,
        values.password,
        Boolean(values.remember),
      );
      setStatus("success");
      setMessage("Signed in successfully. Redirecting…");
      const next = searchParams.get("next");
      router.replace(getPostAuthDestination(user, next));
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "We couldn’t sign you in. Check your details and try again.",
      );
    }
  });

  return (
    <form className="space-y-4" onSubmit={onSubmit} noValidate>
      {status === "error" && message ? (
        <AuthAlert
          variant="error"
          title="Sign-in failed"
          description={message}
        />
      ) : null}
      {status === "success" && message ? (
        <AuthAlert
          variant="success"
          title="Welcome back"
          description={message}
        />
      ) : null}

      <FormField id="login-email" label="Email" error={errors.email?.message} required>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          placeholder="you@organization.com"
          required
          aria-required="true"
          aria-invalid={Boolean(errors.email) || undefined}
          aria-describedby={errors.email ? "login-email-error" : undefined}
          disabled={loading}
          className="h-10"
          {...register("email")}
        />
      </FormField>

      <FormField
        id="login-password"
        label="Password"
        error={errors.password?.message}
        required
      >
        <PasswordInput
          id="login-password"
          autoComplete="current-password"
          placeholder="Enter your password"
          required
          aria-required="true"
          invalid={Boolean(errors.password)}
          aria-describedby={
            errors.password ? "login-password-error" : undefined
          }
          disabled={loading}
          {...register("password")}
        />
      </FormField>

      <div className="flex items-center justify-between gap-3">
        <Controller
          name="remember"
          control={control}
          render={({ field }) => (
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={Boolean(field.value)}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                disabled={loading}
              />
              <span>Remember me</span>
            </label>
          )}
        />
        <Link
          href={AUTH_ROUTES.forgotPassword}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-ring text-sm underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
        >
          Forgot password?
        </Link>
      </div>

      <Button type="submit" className="h-10 w-full" disabled={loading}>
        {loading ? (
          <>
            <span
              className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
              aria-hidden="true"
            />
            Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link
          href={AUTH_ROUTES.register}
          className={cn(
            buttonVariants({ variant: "link" }),
            "h-auto px-0 text-sm",
          )}
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}
