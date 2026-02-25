import { useState, useCallback, useEffect, useRef } from "react";

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const DRIVE_FILE_NAME = "wedagent-notes.json";
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";
const CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID as string) || "";
const STORAGE_KEY_FILE_ID = "wedagent_drive_file_id";
const STORAGE_KEY_LAST_SYNCED = "wedagent_drive_last_synced";

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
          }) => { requestToken: () => void };
          revoke: (token: string, done?: () => void) => void;
        };
      };
    };
  }
}

export function useGoogleDrive() {
  const [token, setToken] = useState<string | null>(null);
  const [gisReady, setGisReady] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_LAST_SYNCED);
    return stored ? new Date(stored) : null;
  });
  const [syncError, setSyncError] = useState<string | null>(null);
  const fileIdRef = useRef<string | null>(localStorage.getItem(STORAGE_KEY_FILE_ID));

  // Load Google Identity Services script
  useEffect(() => {
    if (!CLIENT_ID) return;
    if (window.google?.accounts?.oauth2) {
      setGisReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => setGisReady(true);
    document.head.appendChild(script);
    return () => {
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, []);

  const connect = useCallback(() => {
    if (!CLIENT_ID || !gisReady || !window.google) return;
    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: DRIVE_SCOPE,
      callback: (response) => {
        if (response.access_token) {
          setToken(response.access_token);
          setSyncError(null);
        } else {
          setSyncError("Could not connect to Google Drive");
        }
      },
    });
    tokenClient.requestToken();
  }, [gisReady]);

  const disconnect = useCallback(() => {
    if (token && window.google?.accounts?.oauth2) {
      window.google.accounts.oauth2.revoke(token);
    }
    setToken(null);
  }, [token]);

  const saveNotes = useCallback(async (notes: Note[]): Promise<boolean> => {
    if (!token) return false;
    setIsSyncing(true);
    setSyncError(null);
    try {
      const fileContent = JSON.stringify({ notes, savedAt: new Date().toISOString() });
      const boundary = "wedagent_mp_boundary";
      const metadata = JSON.stringify({ name: DRIVE_FILE_NAME, mimeType: "application/json" });
      const multipart = [
        `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}`,
        `--${boundary}\r\nContent-Type: application/json\r\n\r\n${fileContent}`,
        `--${boundary}--`,
      ].join("\r\n");

      const fid = fileIdRef.current;
      const url = fid
        ? `https://www.googleapis.com/upload/drive/v3/files/${fid}?uploadType=multipart`
        : "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";
      const method = fid ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": `multipart/related; boundary=${boundary}`,
        },
        body: multipart,
      });

      if (res.status === 401) {
        setToken(null);
        setSyncError("Session expired — reconnect Google Drive");
        return false;
      }
      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      if (data.id && data.id !== fileIdRef.current) {
        fileIdRef.current = data.id;
        localStorage.setItem(STORAGE_KEY_FILE_ID, data.id);
      }
      const now = new Date();
      setLastSynced(now);
      localStorage.setItem(STORAGE_KEY_LAST_SYNCED, now.toISOString());
      return true;
    } catch {
      setSyncError("Failed to save to Drive — try again");
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [token]);

  const loadNotes = useCallback(async (): Promise<Note[] | null> => {
    if (!token) return null;
    setIsSyncing(true);
    setSyncError(null);
    try {
      // If no file ID cached, search Drive for the file
      if (!fileIdRef.current) {
        const searchRes = await fetch(
          `https://www.googleapis.com/drive/v3/files?q=name%3D'${DRIVE_FILE_NAME}'+and+trashed%3Dfalse&fields=files(id)&spaces=drive`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!searchRes.ok) throw new Error("Search failed");
        const { files } = await searchRes.json();
        if (!files?.length) {
          setSyncError("No saved notes found in Drive");
          return null;
        }
        fileIdRef.current = files[0].id;
        localStorage.setItem(STORAGE_KEY_FILE_ID, files[0].id);
      }

      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileIdRef.current}?alt=media`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status === 404) {
        fileIdRef.current = null;
        localStorage.removeItem(STORAGE_KEY_FILE_ID);
        setSyncError("Drive file not found — save first to create it");
        return null;
      }
      if (res.status === 401) {
        setToken(null);
        setSyncError("Session expired — reconnect Google Drive");
        return null;
      }
      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      const now = new Date();
      setLastSynced(now);
      localStorage.setItem(STORAGE_KEY_LAST_SYNCED, now.toISOString());
      return (data.notes as Note[]) ?? null;
    } catch {
      setSyncError("Failed to load from Drive — try again");
      return null;
    } finally {
      setIsSyncing(false);
    }
  }, [token]);

  return {
    isConnected: !!token,
    isConfigured: !!CLIENT_ID,
    isReady: gisReady,
    isSyncing,
    lastSynced,
    syncError,
    connect,
    disconnect,
    saveNotes,
    loadNotes,
  };
}
