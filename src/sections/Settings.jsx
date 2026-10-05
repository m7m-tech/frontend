import React, { useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { LogOut, MessageCircle } from "lucide-react";
import PageHeader from "../components/layout/PageHeader";
import { Button, Card } from "../components/ui/Card";
import { Badge } from "../components/ui/StatusBadge";
import { ErrorState } from "../components/ui/States";
import { useAuth } from "../context/AuthContext";
import { useWhatsAppDisconnect } from "../hooks/useWhatsApp";
import { WA_STATE } from "../services/whatsappService";
import { displayName, roleLabel } from "../services/companyService";

const Row = ({ label, children }) => (
  <div className="flex justify-between gap-4 border-t border-line py-3 text-sm first:border-t-0">
    <dt className="text-gray">{label}</dt>
    <dd className="min-w-0 truncate text-right">{children || "—"}</dd>
  </div>
);

const WA_BADGE = {
  [WA_STATE.CONNECTED]: ["lime", "Connected"],
  [WA_STATE.CONNECTING]: ["neutral", "Connecting"],
  [WA_STATE.DISCONNECTED]: ["alert", "Disconnected"],
  [WA_STATE.NOT_CONFIGURED]: ["alert", "Not connected"],
  [WA_STATE.UNKNOWN]: ["neutral", "Status unknown"],
};

const WhatsAppIntegration = ({ companyId, whatsapp }) => {
  const [confirming, setConfirming] = useState(false);
  const { disconnect, pending, error } = useWhatsAppDisconnect(companyId);
  const state = whatsapp.data?.state;
  const [tone, label] = WA_BADGE[state] || WA_BADGE[WA_STATE.UNKNOWN];

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-soft">
            <MessageCircle size={18} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-lg font-medium">WhatsApp integration</h2>
            <p className="text-[13px] text-gray">Receives customer orders from your business WhatsApp.</p>
          </div>
        </div>
        {!whatsapp.isLoading && whatsapp.data && <Badge tone={tone}>{label}</Badge>}
      </div>

      {whatsapp.isLoading ? (
        <div className="skeleton mt-5 h-10 w-48 rounded-full" aria-hidden="true" />
      ) : whatsapp.error && !whatsapp.data ? (
        <ErrorState title="Unable to load WhatsApp status." onRetry={whatsapp.refetch} className="py-5!" />
      ) : (
        <div className="mt-5 space-y-3">
          {whatsapp.data?.raw && (
            <p className="text-xs text-gray">
              Backend status: <span className="font-mono">{whatsapp.data.raw}</span>
            </p>
          )}
          {whatsapp.data?.phone && (
            <p className="text-sm">
              Linked number: <span dir="ltr" className="font-medium">{whatsapp.data.phone}</span>
            </p>
          )}
          {state === WA_STATE.CONNECTED ? (
            confirming ? (
              <div className="rounded-2xl border border-alert/20 bg-alert-soft p-4">
                <p className="text-sm font-medium">Disconnect WhatsApp?</p>
                <p className="mt-1 text-[13px] text-gray">
                  RouteX will stop receiving orders from WhatsApp until you scan a new QR code.
                </p>
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" onClick={() => setConfirming(false)} disabled={pending}>
                    Keep connected
                  </Button>
                  <Button
                    variant="danger"
                    disabled={pending}
                    onClick={async () => {
                      if (await disconnect()) setConfirming(false);
                    }}
                  >
                    {pending ? "Disconnecting…" : "Disconnect"}
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setConfirming(true)}>
                Disconnect WhatsApp
              </Button>
            )
          ) : (
            <Link
              to="/whatsapp-setup"
              className="inline-flex rounded-full bg-black px-4 py-2.5 text-sm font-medium text-white hover:bg-deep"
            >
              {state === WA_STATE.NOT_CONFIGURED ? "Connect WhatsApp" : "Reconnect WhatsApp"}
            </Link>
          )}
          {error && <p role="alert" className="text-xs text-alert">{error}</p>}
        </div>
      )}
    </Card>
  );
};

const Settings = () => {
  const { companyId, profile, whatsapp } = useOutletContext();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div>
      <PageHeader title="Settings" description="Your profile, company and integrations." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-3 text-lg font-medium">My profile</h2>
          <dl>
            <Row label="Name">{displayName(user)}</Row>
            <Row label="Email">{user?.email}</Row>
            <Row label="Phone"><span dir="ltr">{user?.phone}</span></Row>
            <Row label="Role">{roleLabel(user?.role)}</Row>
          </dl>
        </Card>

        <Card className="p-6">
          <h2 className="mb-3 text-lg font-medium">Company</h2>
          <dl>
            <Row label="Company">{profile.name}</Row>
            <Row label="Country">{profile.country}</Row>
            <Row label="Fleet invite code">{profile.inviteCode || "Not available yet"}</Row>
            <Row label="Company ID"><span className="font-mono text-xs">{companyId}</span></Row>
          </dl>
        </Card>

        <WhatsAppIntegration companyId={companyId} whatsapp={whatsapp} />

        <Card className="flex flex-col justify-between gap-4 p-6">
          <div>
            <h2 className="text-lg font-medium">Session</h2>
            <p className="mt-1 text-sm text-gray">Sign out of RouteX on this device.</p>
          </div>
          <Button
            variant="outline"
            className="self-start text-alert!"
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
          >
            <LogOut size={16} aria-hidden="true" /> Log out
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
