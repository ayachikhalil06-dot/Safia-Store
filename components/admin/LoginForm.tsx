"use client";

import { useState, useTransition } from "react";
import { loginAction } from "@/app/actions/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await loginAction(formData);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-neutral-900">
            Administration
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Connectez-vous pour accéder au tableau de bord.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <Input
              id="email"
              name="email"
              type="email"
              label="Email"
              placeholder="admin@example.com"
              required
              autoComplete="email"
            />
            <Input
              id="password"
              name="password"
              type="password"
              label="Mot de passe"
              required
              autoComplete="current-password"
            />

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <Button type="submit" className="w-full" loading={isPending}>
              Se connecter
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
