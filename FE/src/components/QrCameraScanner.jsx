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
              ? "Trình duyệt đã chặn quyền truy cập Camera. Vui lòng cho phép quyền Camera trên thanh địa chỉ và thử lại."
              : `Không thể kết nối với Webcam/Camera: ${msg}`
          );
        }
      }
    }

    // Delay slightly to ensure element is rendered in DOM
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
    <div className="relative overflow-hidden rounded-[14px] border border-[#dfe7f5] bg-[#0b1c30] p-4 text-white shadow-xl">
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-[#2dd4a0]">photo_camera</span>
          <span className="text-[13px] font-bold">Quét Mã QR Check-in Qua Camera</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>

      {starting && (
        <div className="flex h-64 flex-col items-center justify-center gap-2 text-xs text-[#8996a9]">
          <span className="material-symbols-outlined animate-spin text-[28px] text-[#1d5fe5]">progress_activity</span>
          <span>Đang kích hoạt camera...</span>
        </div>
      )}

      {error ? (
        <div className="rounded-[10px] bg-red-950/80 p-4 text-center text-xs text-red-200">
          <span className="material-symbols-outlined text-3xl text-red-400">videocam_off</span>
          <p className="mt-2 font-medium">{error}</p>
          <button
            type="button"
            onClick={onClose}
            className="mt-3 rounded-[8px] bg-white/20 px-4 py-1.5 font-bold text-white hover:bg-white/30"
          >
            Đóng Camera
          </button>
        </div>
      ) : (
        <div className="relative mx-auto w-full max-w-[340px] overflow-hidden rounded-[10px] bg-black">
          {/* Container for html5-qrcode video */}
          <div id={elementId.current} className="w-full" />

          {/* Aiming border overlay */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative h-48 w-48 rounded-xl border-2 border-dashed border-[#2dd4a0]/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]">
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
        Hướng camera về mã QR trên điện thoại của khách hàng để tự động nhận diện và tra cứu.
      </p>
    </div>
  );
}
