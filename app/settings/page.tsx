import type { Metadata } from "next";
import Link from "next/link";
import { AlertPreferences } from "@/components/settings/AlertPreferences";
import { DemoNotice } from "@/components/ui/DemoNotice";
import { PageHeader } from "@/components/ui/PageHeader";
import { member } from "@/data/member";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Settings",
  description: "Your profile, alert preferences, and data stored in this browser.",
};

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Manage alerts and review the contact details on file." />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <section aria-labelledby="profile-heading" className="card p-5">
          <h2 id="profile-heading" className="text-lg font-semibold text-navy">
            Profile
          </h2>
          <dl className="mt-4 space-y-3">
            <div>
              <dt className="text-sm text-muted">Name</dt>
              <dd className="font-semibold text-ink">
                {member.firstName} {member.lastName}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Member since</dt>
              <dd className="font-semibold text-ink">{formatDate(member.memberSince)}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Email</dt>
              <dd className="font-semibold text-ink">{member.email}</dd>
            </div>
            <div>
              <dt className="text-sm text-muted">Phone</dt>
              <dd className="font-semibold text-ink">{member.phone}</dd>
            </div>
          </dl>
          <div className="mt-5">
            <DemoNotice>
              Profile details are synthetic and read-only in this demo. Learn{" "}
              <Link href="/help/update-contact-information" className="font-semibold underline">
                how contact updates work
              </Link>
              .
            </DemoNotice>
          </div>
        </section>

        <section aria-labelledby="alerts-heading" className="card p-5">
          <h2 id="alerts-heading" className="text-lg font-semibold text-navy">
            Account alerts
          </h2>
          <p className="mt-1 text-sm text-muted">
            Alerts help you spot pending transactions, low balances, and delayed transfers early.
          </p>
          <AlertPreferences />
        </section>
      </div>
    </>
  );
}
