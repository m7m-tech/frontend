import React, { useEffect, useState } from "react";
import QRCode from "qrcode";

const isImageSrc = (v) => /^(data:image\/|https?:\/\/)/i.test(v);
const isBareBase64Png = (v) => /^iVBORw0KGgo/.test(v);

// Renders exactly what the backend returned: an image (data URL / URL /
// bare base64 PNG) as-is, or a raw WhatsApp pairing string encoded locally
// into a QR image. Never generates a code of its own.
const WhatsAppQr = ({ value, size = 264 }) => {
  const [src, setSrc] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    if (isImageSrc(value)) setSrc(value);
    else if (isBareBase64Png(value)) setSrc(`data:image/png;base64,${value}`);
    else {
      QRCode.toDataURL(value, { margin: 1, width: size * 2, errorCorrectionLevel: "L", color: { dark: "#222222", light: "#FFFFFF" } })
        .then((url) => !cancelled && setSrc(url))
        .catch(() => !cancelled && setFailed(true));
    }
    return () => {
      cancelled = true;
    };
  }, [value, size]);

  if (failed) return <p className="p-6 text-center text-sm text-alert">This QR code couldn't be displayed. Generate a new one.</p>;
  if (!src) return <div className="skeleton rounded-2xl" style={{ width: size, height: size }} aria-hidden="true" />;

  return (
    <img
      src={src}
      width={size}
      height={size}
      alt="WhatsApp linking QR code. Scan it from WhatsApp, Linked devices, Link a device."
      className="rounded-xl [image-rendering:pixelated]"
    />
  );
};

export default WhatsAppQr;
