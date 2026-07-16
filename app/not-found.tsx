import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-32 text-center">
      <h1 className="text-6xl font-semibold text-neutral-900">404</h1>
      <p className="mt-4 text-lg text-neutral-600">
        La page que vous recherchez n&apos;existe pas.
      </p>
      <Link href="/" className="mt-8">
        <Button>Retour à l&apos;accueil</Button>
      </Link>
    </div>
  );
}
