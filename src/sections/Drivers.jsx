import React from "react";
import { useOutletContext } from "react-router-dom";
import { Smartphone, UserPlus, Users } from "lucide-react";
import PageHeader from "../components/layout/PageHeader";
import FleetInviteCode from "../components/layout/FleetInviteCode";
import { Card } from "../components/ui/Card";
import { EmptyState } from "../components/ui/States";

// Backend today exposes only POST /drivers/join (driver app) and
// PATCH /owner/drivers/:id/status (approve/reject) — there is no endpoint to
// list drivers or pending join requests, so there are no ids to act on yet.
// The page keeps its structure and says so plainly instead of faking rows.
const Drivers = () => {
  const { profile } = useOutletContext();

  return (
    <div>
      <PageHeader title="Drivers" description="Invite drivers to your fleet and manage their access." />

      <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
        <Card className="space-y-5 p-6">
          <div>
            <h2 className="text-lg font-medium">Invite drivers</h2>
            <p className="mt-1 text-sm text-gray">Share your fleet code. Drivers enter it in the RouteX mobile app to request to join.</p>
          </div>
          <FleetInviteCode code={profile.inviteCode} compact />
          {!profile.inviteCode && (
            <p className="rounded-xl bg-canvas px-3.5 py-2.5 text-xs leading-relaxed text-gray">
              Your fleet invite code isn't available yet. It will appear here as soon as it's issued for your company.
            </p>
          )}
          <ol className="space-y-3 text-sm">
            {[
              [Smartphone, "Driver installs the RouteX app"],
              [UserPlus, "Enters your fleet code to request to join"],
              [Users, "You approve the request and they join your fleet"],
            ].map(([Icon, text], i) => (
              <li key={text} className="flex items-center gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-soft text-black">
                  <Icon size={15} aria-hidden="true" />
                </span>
                <span>
                  <span className="text-gray">{i + 1}.</span> {text}
                </span>
              </li>
            ))}
          </ol>
        </Card>

        <div className="flex min-w-0 flex-col gap-4">
          <Card className="p-6">
            <h2 className="text-lg font-medium">Join requests</h2>
            <EmptyState
              icon={UserPlus}
              title="No join requests to show"
              description="Pending driver requests will be listed here for approval once they're available to RouteX."
              className="min-h-[180px]"
            />
          </Card>
          <Card className="p-6">
            <h2 className="text-lg font-medium">Fleet</h2>
            <EmptyState
              icon={Users}
              title="Driver list isn't available yet"
              description="Drivers, their status, current delivery and last GPS update will appear here once fleet data is available."
              className="min-h-[220px]"
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Drivers;
