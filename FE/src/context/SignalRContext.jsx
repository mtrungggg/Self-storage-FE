import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import signalRService from "../services/signalrService";
import { useAuth } from "./AuthContext";

const SignalRContext = createContext({
  connected: false,
  joinFacility: () => {},
  leaveFacility: () => {},
  subscribe: () => () => {},
  recentEvent: null,
});

export function SignalRProvider({ children }) {
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);
  const [recentEvent, setRecentEvent] = useState(null);
  const [liveToast, setLiveToast] = useState(null);

  useEffect(() => {
    if (!user) {
      signalRService.stop();
      setConnected(false);
      return;
    }

    signalRService.start().then(() => {
      setConnected(true);
    });

    const unsubs = [
      signalRService.on("ReceiveNotification", (data) => {
        setRecentEvent({ type: "notification", data, time: Date.now() });
        setLiveToast({
          title: data?.title || "Thông báo mới",
          message: data?.message || "",
          type: "info",
        });
      }),
      signalRService.on("TicketUpdated", (data) => {
        setRecentEvent({ type: "ticket", data, time: Date.now() });
        setLiveToast({
          title: "Cập nhật Ticket",
          message: data?.title ? `Ticket #${data.ticketCode || data.id}: ${data.title}` : "Một ticket vừa được cập nhật",
          type: "warning",
        });
      }),
      signalRService.on("TransferRequestUpdated", (data) => {
        setRecentEvent({ type: "transfer", data, time: Date.now() });
        setLiveToast({
          title: "Yêu cầu chuyển kho",
          message: data?.agreementNo ? `Hợp đồng ${data.agreementNo} có thay đổi yêu cầu chuyển kho.` : "Có yêu cầu chuyển kho mới.",
          type: "info",
        });
      }),
      signalRService.on("TaskAssigned", (data) => {
        setRecentEvent({ type: "task", data, time: Date.now() });
        setLiveToast({
          title: "Phân công công việc mới",
          message: data?.title || "Bạn vừa được phân công một nhiệm vụ mới.",
          type: "success",
        });
      }),
      signalRService.on("RefundUpdated", (data) => {
        setRecentEvent({ type: "refund", data, time: Date.now() });
        setLiveToast({
          title: "Cập nhật hoàn cọc",
          message: data?.status ? `Yêu cầu hoàn cọc của bạn đã chuyển sang trạng thái: ${data.status}` : "Trạng thái hoàn cọc đã thay đổi.",
          type: "success",
        });
      }),
      signalRService.on("UnitStatusChanged", (data) => {
        setRecentEvent({ type: "unit", data, time: Date.now() });
      }),
    ];

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [user]);

  // Auto-dismiss live toast after 5s
  useEffect(() => {
    if (!liveToast) return;
    const timer = setTimeout(() => {
      setLiveToast(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [liveToast]);

  const joinFacility = useCallback((facilityId) => {
    signalRService.joinFacility(facilityId);
  }, []);

  const leaveFacility = useCallback((facilityId) => {
    signalRService.leaveFacility(facilityId);
  }, []);

  const subscribe = useCallback((eventName, callback) => {
    return signalRService.on(eventName, callback);
  }, []);

  return (
    <SignalRContext.Provider value={{ connected, joinFacility, leaveFacility, subscribe, recentEvent }}>
      {children}
      {liveToast && (
        <div className="fixed bottom-5 right-5 z-[9999] max-w-sm animate-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-white/95 p-4 shadow-2xl backdrop-blur-md">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
              <span className="material-symbols-outlined text-[18px]">notifications_active</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900">{liveToast.title}</div>
              <div className="mt-0.5 text-[11px] text-slate-600 line-clamp-2">{liveToast.message}</div>
            </div>
            <button
              type="button"
              onClick={() => setLiveToast(null)}
              className="text-slate-400 hover:text-slate-600 transition -mr-1 -mt-1 p-1"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        </div>
      )}
    </SignalRContext.Provider>
  );
}

export function useSignalR() {
  return useContext(SignalRContext);
}
