import { Compass } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function NotFound() {
  return (
    <div className="card">
      <h1 className="sr-only">Page not found</h1>
      <EmptyState
        icon={Compass}
        title="We couldn't find that page"
        description="The link may be out of date. You can head back to your overview or search the Help Center."
        actions={
          <>
            <ButtonLink href="/">Go to Overview</ButtonLink>
            <ButtonLink href="/help" variant="secondary">
              Visit the Help Center
            </ButtonLink>
          </>
        }
      />
    </div>
  );
}
