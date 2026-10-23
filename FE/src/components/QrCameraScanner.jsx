import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

export default function QrCameraScanner({ onScan, onClose }) {
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(true);
  const scannerRef = useRef(null);
  const elementId = useRef(`qr-reader-${Math.random().toString(36).substring(2, 9)}`);
  const activeRef = useRef(true);

  useEffect(() => {
    activeRef.current = true;
    let qrScanner = null;

    async function init() {
      try {
        qrScanner = new Html5Qrcode(elementId.current);
        scannerRef.current = qrScanner;

        await qrScanner.start(
          { facingMode: "environment" },
          {
            fps: 12,
            qrbox: { width: 240, height: 240 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            if (!activeRef.current) return;
            activeRef.current = false;
            if (qrScanner.isScanning) {
              qrScanner
                .stop()
                .then(() => {
                  try {
                    qrScanner.clear();
                  } catch (_) {}
                })
                .catch(() => {})
                .finally(() => {
                  onScan(decodedText.trim());
                });
            } else {
              onScan(decodedText.trim());
            }
          },
          () => {} // Frame drop callback
        );

        if (activeRef.current) setStarting(false);
      } catch (err) {
        if (activeRef.current) {
          setStarting(false);
          const msg = err?.message || String(err);
          setError(
            msg.includes("Permission") || msg.includes("NotAllowedError")
              ? "Camera access is blocked. Allow camera access in your browser and try again."
              : `Unable to connect to the camera: ${msg}`
          );
        }
      }
    }

    const timer = setTimeout(init, 100);

    return () => {
      activeRef.current = false;
      clearTimeout(timer);
      if (scannerRef.current) {
        const instance = scannerRef.current;
        if (instance.isScanning) {
          instance
            .stop()
            .then(() => {
              try {
                instance.clear();
              } catch (_) {}
            })
            .catch(() => {});
        } else {
          try {
            instance.clear();
          } catch (_) {}
        }
      }
    };
  }, [onScan]);

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-700 bg-slate-900 p-4 text-white shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Camera Scanner
        </span>
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-semibold px-2 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition"
        >
          Close
        </button>
      </div>

      {starting && (
        <div className="flex h-56 flex-col items-center justify-center gap-2 text-xs text-slate-400">
          <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Activating camera...</span>
        </div>
      )}

      {error ? (
        <div className="rounded-lg bg-red-950/80 p-4 text-center text-xs text-red-200">
          <p className="font-medium">{error}</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-3 rounded bg-white/20 px-3 py-1 text-xs font-bold text-white hover:bg-white/30"
          >
            Close Scanner
          </button>
        </div>
      ) : (
        <div className="relative mx-auto w-full max-w-[320px] overflow-hidden rounded-lg bg-black">
          <div id={elementId.current} className="w-full" />
        </div>
      )}

      <p className="mt-3 text-center text-[11px] text-slate-400">
        Point camera at the customer's QR code on their phone screen.
      </p>
    </div>
  );
}
