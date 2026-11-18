import * as signalR from "@microsoft/signalr";
import appConfig from "../config/appConfig";
import STORAGE_KEYS from "../constants/storageKeys";

class SignalRService {
  constructor() {
    this.connection = null;
    this.listeners = new Map();
    this.currentFacilityId = null;
    this.isStarting = false;
  }

  getHubUrl() {
    const base = appConfig.api.baseUrl.replace(/\/api\/?$/, "");
    return `${base}/hubs/notifications`;
  }

  getToken() {
    return (
      sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) ||
      localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) ||
      ""
    );
  }

  getConnection() {
    if (this.connection) return this.connection;

    const hubUrl = this.getHubUrl();

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => this.getToken(),
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(
        appConfig.app.isDevelopment ? signalR.LogLevel.Information : signalR.LogLevel.Warning
      )
      .build();

    this.connection.onreconnected(async () => {
      console.log("[SignalR] Reconnected successfully.");
      if (this.currentFacilityId) {
        await this.joinFacility(this.currentFacilityId);
      }
    });

    this.connection.onclose((err) => {
      console.warn("[SignalR] Connection closed.", err);
    });

    // Wire up already registered listeners
    for (const [eventName, callbacks] of this.listeners.entries()) {
      this.connection.on(eventName, (...args) => {
        callbacks.forEach((cb) => cb(...args));
      });
    }

    return this.connection;
  }

  async start() {
    const conn = this.getConnection();
    if (conn.state === signalR.HubConnectionState.Connected) {
      return true;
    }
    if (this.isStarting || conn.state === signalR.HubConnectionState.Connecting) {
      return false;
    }

    this.isStarting = true;
    try {
      await conn.start();
      console.log("[SignalR] Connected to notifications hub.");
      if (this.currentFacilityId) {
        await this.joinFacility(this.currentFacilityId);
      }
      return true;
    } catch (err) {
      console.warn("[SignalR] Failed to start connection (will retry automatically):", err);
      return false;
    } finally {
      this.isStarting = false;
    }
  }

  async stop() {
    this.currentFacilityId = null;
    this.isStarting = false;
    if (this.connection) {
      try {
        await this.connection.stop();
        console.log("[SignalR] Disconnected.");
      } catch (err) {
        console.warn("[SignalR] Error stopping connection:", err);
      } finally {
        this.connection = null;
      }
    }
  }

  on(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
      if (this.connection) {
        this.connection.on(eventName, (...args) => {
          const cbs = this.listeners.get(eventName);
          if (cbs) cbs.forEach((cb) => cb(...args));
        });
      }
    }
    this.listeners.get(eventName).add(callback);

    // Return cleanup unsubscribe function
    return () => this.off(eventName, callback);
  }

  off(eventName, callback) {
    const cbs = this.listeners.get(eventName);
    if (cbs) {
      cbs.delete(callback);
      if (cbs.size === 0) {
        this.listeners.delete(eventName);
        if (this.connection) {
          this.connection.off(eventName);
        }
      }
    }
  }

  async joinFacility(facilityId) {
    const idNum = Number(facilityId);
    if (!Number.isFinite(idNum) || idNum <= 0) return;
    this.currentFacilityId = idNum;
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke("JoinFacility", idNum);
        console.log(`[SignalR] Joined facility_${idNum}`);
      } catch (err) {
        console.warn(`[SignalR] Failed to join facility_${idNum}:`, err);
      }
    }
  }

  async leaveFacility(facilityId) {
    const idNum = Number(facilityId);
    if (this.connection?.state === signalR.HubConnectionState.Connected && Number.isFinite(idNum) && idNum > 0) {
      try {
        await this.connection.invoke("LeaveFacility", idNum);
        console.log(`[SignalR] Left facility_${idNum}`);
      } catch (err) {
        console.warn(`[SignalR] Failed to leave facility_${idNum}:`, err);
      }
    }
    if (this.currentFacilityId === idNum) {
      this.currentFacilityId = null;
    }
  }
}

export const signalRService = new SignalRService();
export default signalRService;
