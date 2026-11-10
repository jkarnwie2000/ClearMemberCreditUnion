"use client";

import { TriangleAlert } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="card">
      <h1 className="sr-only">Something went wrong</h1>
      <EmptyState
        icon={TriangleAlert}
        title="Something went wrong on this page"
        description="Your accounts are not affected. Try again, or go back to your overview."
        actions={
          <>
            <Button onClick={reset}>Try again</Button>
            <ButtonLink href="/" variant="secondary">
              Go to Overview
            </ButtonLink>
          </>
        }
      />
    </div>
  );
}
