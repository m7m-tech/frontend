import React from "react";
import { Link } from "react-router-dom";
import { Users } from "lucide-react";
import { Card, CardHeader } from "../ui/Card";
import { EmptyState } from "../ui/States";

// The backend doesn't expose a driver list or driver/tracking statuses yet,
// so this card keeps its place in the layout with an honest empty state
// rather than placeholder numbers.
const DriversStatusCard = () => (
  <Card className="flex min-h-[244px] flex-col p-5">
    <CardHeader title="Drivers by status" to="/drivers" linkLabel="Open drivers" />
    <EmptyState
      icon={Users}
      title="Driver status isn't available yet"
      description="On-shift, delivering, offline and GPS states will appear here once driver tracking is enabled for your fleet."
      action={
        <Link to="/drivers" className="mt-1 text-[13px] font-medium text-black underline underline-offset-2">
          Invite drivers to your fleet
        </Link>
      }
      className="flex-1"
    />
  </Card>
);

export default DriversStatusCard;
