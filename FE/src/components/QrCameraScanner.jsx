import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useLanguage } from "../context/LanguageContext";

export default function QrCameraScanner({ onScan, onClose }) {
  const { t, lang } = useLanguage();
  const isVi = lang === "vi";
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(true);
  const scannerRef = useRef(null);
  const elementId = useRef(`qr-reader-${Math.random().toString(36).substring(2, 9)}`);
  const onScanRef = useRef(onScan);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    let isMounted = true;
    let qrScanner = null;

    async function initCamera() {
      const container = document.getElementById(elementId.current);
      if (container) {
        container.innerHTML = "";
      }

      if (!isMounted) return;

      try {
        qrScanner = new Html5Qrcode(elementId.current);
        scannerRef.current = qrScanner;

        await qrScanner.start(
          { facingMode: "environment" },
          {
            fps: 15,
            qrbox: { width: 220, height: 220 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            if (!isMounted) return;
            isMounted = false;
            if (qrScanner?.isScanning) {
              qrScanner
                .stop()
                .then(() => {
                  try {
                    qrScanner.clear();
                  } catch (_) {}
                })
                .catch(() => {})
                .finally(() => {
                  onScanRef.current?.(decodedText.trim());
                });
            } else {
              onScanRef.current?.(decodedText.trim());
            }
          },
          () => {} // Frame drop callback
        );

        if (isMounted) {
          setStarting(false);
        } else {
          // If unmounted while starting
          if (qrScanner?.isScanning) {
            qrScanner
              .stop()
              .then(() => {
                try {
                  qrScanner.clear();
                } catch (_) {}
              })
              .catch(() => {});
          }
        }
      } catch (err) {
        if (isMounted) {
          setStarting(false);
          const msg = err?.message || String(err);
          setError(
            msg.includes("Permission") || msg.includes("NotAllowedError")
              ? (isVi ? "Quyền truy cập Camera bị chặn. Vui lòng cấp quyền trong trình duyệt và thử lại." : "Camera access is blocked. Allow camera access in your browser and try again.")
              : `${isVi ? "Không thể kết nối camera" : "Unable to connect to the camera"}: ${msg}`
          );
        }
      }
    }

    const timer = setTimeout(initCamera, 80);

    return () => {
      isMounted = false;
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
      const container = document.getElementById(elementId.current);
      if (container) {
        container.innerHTML = "";
      }
    };
  }, []); // Run strictly once on mount

  return (
    <div className="relative overflow-hidden rounded-[14px] border border-[#dfe7f5] bg-[#0b1c30] p-3.5 sm:p-4 text-white shadow-xl">
      <style>{`
        #${elementId.current} {
          width: 100% !important;
          height: 100% !important;
          overflow: hidden !important;
          position: relative !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          border-radius: 12px !important;
        }
        #${elementId.current} video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          display: block !important;
          border-radius: 12px !important;
        }
        #${elementId.current} canvas {
          display: none !important;
        }
        #${elementId.current} #qr-shaded-region {
          display: none !important;
        }
      `}</style>

      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-[#2dd4a0]">photo_camera</span>
          <span className="text-[13px] font-bold">{t("common.scan_qr", "Quét mã QR")}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      {error ? (
        <div className="rounded-[10px] bg-red-950/80 p-4 text-center text-xs text-red-200">
          <span className="material-symbols-outlined text-3xl text-red-400">videocam_off</span>
          <p className="mt-2 font-medium">{error}</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-3 rounded-[8px] bg-white/20 px-4 py-1.5 font-bold text-white hover:bg-white/30"
          >
            {t("common.close_camera", "Đóng camera")}
          </button>
        </div>
      ) : (
        <div className="relative mx-auto w-full max-w-[280px] sm:max-w-[320px] aspect-square overflow-hidden rounded-xl bg-black shadow-inner">
          {/* Container for html5-qrcode video */}
          <div id={elementId.current} className="h-full w-full" />

          {/* Loading overlay while camera initializes */}
          {starting && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-[#0b1c30]/90 text-xs text-[#8996a9]">
              <span className="material-symbols-outlined animate-spin text-[28px] text-[#2dd4a0]">progress_activity</span>
              <span>{t("common.starting_camera", "Đang khởi động camera...")}</span>
            </div>
          )}

          {/* Aiming border overlay (Single unified viewfinder) */}
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
            <div className="relative h-44 w-44 rounded-xl border-2 border-dashed border-[#2dd4a0]/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]">
              {/* Corner accents */}
              <div className="absolute -left-1 -top-1 h-4 w-4 border-l-4 border-t-4 border-[#2dd4a0]" />
              <div className="absolute -right-1 -top-1 h-4 w-4 border-r-4 border-t-4 border-[#2dd4a0]" />
              <div className="absolute -bottom-1 -left-1 h-4 w-4 border-b-4 border-l-4 border-[#2dd4a0]" />
              <div className="absolute -bottom-1 -right-1 h-4 w-4 border-b-4 border-r-4 border-[#2dd4a0]" />

              {/* Scanning laser line animation */}
              <div className="absolute inset-x-0 h-0.5 animate-pulse bg-gradient-to-r from-transparent via-[#2dd4a0] to-transparent top-1/2" />
            </div>
          </div>
        </div>
      )}

      <p className="mt-3 text-center text-[11px] text-[#8996a9]">
        {isVi
          ? "Hướng camera vào mã QR check-in của khách để quét thông tin tự động."
          : "Point the camera at the customer's QR code to scan and look up their check-in."}
      </p>
    </div>
  );
}
