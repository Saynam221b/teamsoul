"use client";

import Image from "next/image";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const ROOT_PREFIX = "BGMI_2026_current_with_higglist_bgis";
const DB_TABLES = [
  "organizations",
  "viewership_milestones",
  "eras",
  "era_key_players",
  "players",
  "player_stints",
  "tournaments",
  "tournament_rosters",
  "awards",
  "roster_snapshots",
  "roster_snapshot_players",
  "roster_changes",
  "aggregate_stats",
] as const;

type BlobAssetsFile = {
  generatedAt: string;
  totalFiles: number;
  files: Record<string, string>;
};

type EditorState = {
  key: string;
  newKey: string;
  url: string;
  mode: "create" | "update";
};

type DbHealth = {
  schemaReady: boolean;
  seeded: boolean;
  fallbackActive: boolean;
  tableCounts: Record<string, number>;
  tableErrors?: Record<string, string>;
  setupChecklist?: {
    schemaApplied: boolean;
    seedRun: boolean;
    keyTablesReady: boolean;
  };
  error?: string;
};

const INITIAL_EDITOR: EditorState = {
  key: "",
  newKey: "",
  url: "",
  mode: "create",
};

type AdminView = "assets" | "database";

function getFolderFromKey(key: string) {
  const idx = key.lastIndexOf("/");
  return idx === -1 ? ROOT_PREFIX : key.slice(0, idx);
}

export default function AdminSaynamPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [password, setPassword] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [activeView, setActiveView] = useState<AdminView>("assets");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [mapping, setMapping] = useState<BlobAssetsFile | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string>(`${ROOT_PREFIX}/BGIS 2026`);
  const [uploadFolder, setUploadFolder] = useState<string>(`${ROOT_PREFIX}/Uploads`);
  const [editor, setEditor] = useState<EditorState>(INITIAL_EDITOR);
  const [selectedTable, setSelectedTable] = useState<string>("tournaments");
  const [dbRows, setDbRows] = useState<Array<Record<string, unknown>>>([]);
  const [selectedRowId, setSelectedRowId] = useState<string>("");
  const [rowEditor, setRowEditor] = useState<string>("{}");
  const [dbMode, setDbMode] = useState<"create" | "update">("create");
  const [dbHealth, setDbHealth] = useState<DbHealth | null>(null);

  useEffect(() => {
    const savedAuth = window.sessionStorage.getItem("admin_saynam_auth");
    const savedPassword = window.sessionStorage.getItem("admin_saynam_pwd");
    if (savedAuth === "1" && savedPassword) {
      setPassword(savedPassword);
      setAuthorized(true);
    }
  }, []);

  const loadMapping = useCallback(async () => {
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/blob-mapping", {
        headers: { "x-admin-password": password },
      });
      if (!response.ok) {
        throw new Error("Could not load mappings");
      }
      const data = (await response.json()) as BlobAssetsFile;
      setMapping(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }, [password]);

  useEffect(() => {
    if (!authorized) return;
    void loadMapping();
  }, [authorized, loadMapping]);

  const loadDbRows = useCallback(async () => {
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/db/${selectedTable}`, {
        headers: { "x-admin-password": password },
      });
      const data = (await response.json()) as { rows?: Array<Record<string, unknown>>; error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Could not load database rows");
      }
      setDbRows(data.rows ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }, [password, selectedTable]);

  const loadDbHealth = useCallback(async () => {
    setError("");
    try {
      const response = await fetch("/api/admin/db-health", {
        headers: { "x-admin-password": password },
      });
      const data = (await response.json()) as DbHealth & { error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Could not load database health");
      }
      setDbHealth(data);
    } catch (err) {
      setDbHealth(null);
      setError(err instanceof Error ? err.message : "Request failed");
    }
  }, [password]);

  useEffect(() => {
    if (!authorized || activeView !== "database") return;
    void loadDbRows();
    void loadDbHealth();
  }, [authorized, activeView, loadDbRows, loadDbHealth]);

  const allEntries = useMemo(() => {
    if (!mapping) return [];
    return Object.entries(mapping.files).sort(([a], [b]) => a.localeCompare(b));
  }, [mapping]);

  const folders = useMemo(() => {
    const set = new Set<string>();
    for (const [key] of allEntries) {
      set.add(getFolderFromKey(key));
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [allEntries]);

  useEffect(() => {
    if (!folders.length) return;
    if (folders.includes(selectedFolder)) return;
    setSelectedFolder(folders[0]);
  }, [folders, selectedFolder]);

  const visibleEntries = useMemo(() => {
    const filteredByFolder = allEntries.filter(([key]) => getFolderFromKey(key) === selectedFolder);
    if (!search.trim()) return filteredByFolder;
    const term = search.toLowerCase();
    return filteredByFolder.filter(
      ([key, url]) => key.toLowerCase().includes(term) || url.toLowerCase().includes(term)
    );
  }, [allEntries, selectedFolder, search]);

  async function mutateMapping(
    action: "create" | "update" | "delete",
    payload: Partial<EditorState> & { key?: string }
  ) {
    setLoading(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/blob-mapping", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({
          action,
          key: payload.key,
          newKey: payload.newKey,
          url: payload.url,
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Update failed");
      }

      const data = (await response.json()) as BlobAssetsFile;
      setMapping(data);
      setEditor(INITIAL_EDITOR);
      setNotice(`Mapping ${action} successful.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  async function uploadFiles(event: FormEvent) {
    event.preventDefault();
    if (!fileInputRef.current?.files?.length) {
      setError("Select at least one file.");
      return;
    }

    setLoading(true);
    setError("");
    setNotice("");

    try {
      const formData = new FormData();
      formData.append("folder", uploadFolder.trim() || `${ROOT_PREFIX}/Uploads`);
      Array.from(fileInputRef.current.files).forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/admin/blob-upload", {
        method: "POST",
        headers: {
          "x-admin-password": password,
        },
        body: formData,
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Upload failed");
      }

      const data = (await response.json()) as BlobAssetsFile & { uploaded?: Array<{ key: string }> };
      setMapping(data);
      if (uploadFolder.trim()) setSelectedFolder(uploadFolder.trim());
      if (fileInputRef.current) fileInputRef.current.value = "";
      setNotice(`Uploaded ${data.uploaded?.length ?? 0} file(s).`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/db-health", {
        headers: { "x-admin-password": password },
      });
      if (!response.ok) {
        throw new Error("Wrong password.");
      }
      window.sessionStorage.setItem("admin_saynam_auth", "1");
      window.sessionStorage.setItem("admin_saynam_pwd", password);
      setAuthorized(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    window.sessionStorage.removeItem("admin_saynam_auth");
    window.sessionStorage.removeItem("admin_saynam_pwd");
    setAuthorized(false);
    setPassword("");
    setMapping(null);
    setEditor(INITIAL_EDITOR);
    setDbRows([]);
    setRowEditor("{}");
    setSelectedRowId("");
    setNotice("");
    setError("");
  }

  function handleSaveMapping(event: FormEvent) {
    event.preventDefault();
    if (!editor.key.trim() || !editor.url.trim()) {
      setError("Key and URL are required.");
      return;
    }
    void mutateMapping(editor.mode, editor);
  }

  function selectRow(row: Record<string, unknown>) {
    setDbMode("update");
    setSelectedRowId(String(row.id ?? ""));
    setRowEditor(JSON.stringify(row, null, 2));
  }

  function startCreateRow() {
    setDbMode("create");
    setSelectedRowId("");
    setRowEditor("{\n  \"id\": \"\"\n}");
  }

  async function saveDbRow(event: FormEvent) {
    event.preventDefault();
    let row: Record<string, unknown>;
    try {
      row = JSON.parse(rowEditor) as Record<string, unknown>;
    } catch {
      setError("Invalid JSON in row editor.");
      return;
    }

    setLoading(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`/api/admin/db/${selectedTable}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({
          action: dbMode,
          row,
          id: selectedRowId,
        }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Failed to save row");
      }
      setNotice(`Row ${dbMode} successful in ${selectedTable}.`);
      await loadDbRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  async function deleteDbRow() {
    if (!selectedRowId) {
      setError("Pick a row first.");
      return;
    }

    setLoading(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/db/${selectedTable}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({
          action: "delete",
          id: selectedRowId,
        }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete row");
      }
      setNotice(`Row deleted from ${selectedTable}.`);
      startCreateRow();
      await loadDbRows();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-text-primary">
                Admin Console
              </h1>
              <p className="mt-2 text-sm text-text-secondary">
                Manage files and database records in one place.
              </p>
            </div>
            {authorized && (
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-2 rounded-lg bg-surface-card border border-border-subtle text-xs text-text-secondary"
              >
                Logout
              </button>
            )}
          </div>

          {!authorized ? (
            <form
              onSubmit={handleLogin}
              className="max-w-md bg-surface-card border border-border-subtle rounded-2xl p-6 space-y-4"
            >
              <p className="text-xs text-text-muted">
                URL: <code>/admin_saynam</code>
              </p>
              <label className="block text-sm text-text-secondary">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-accent-dim text-accent text-sm border border-accent/20"
              >
                Enter Admin
              </button>
              {error && <p className="text-xs text-rose-400">{error}</p>}
            </form>
          ) : (
            <div className="space-y-6">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveView("assets")}
                  className={`px-3 py-2 rounded-lg text-xs border ${
                    activeView === "assets"
                      ? "bg-accent-dim text-accent border-accent/30"
                      : "bg-surface-card text-text-secondary border-border-subtle"
                  }`}
                >
                  Assets
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView("database")}
                  className={`px-3 py-2 rounded-lg text-xs border ${
                    activeView === "database"
                      ? "bg-accent-dim text-accent border-accent/30"
                      : "bg-surface-card text-text-secondary border-border-subtle"
                  }`}
                >
                  Database
                </button>
              </div>

              {activeView === "assets" ? (
                <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-4">
                  <aside className="bg-surface-card border border-border-subtle rounded-2xl p-3">
                    <h2 className="font-display text-lg text-text-primary mb-3">Folders</h2>
                    <div className="max-h-[60vh] overflow-auto space-y-1">
                      {folders.map((folder) => (
                        <button
                          key={folder}
                          type="button"
                          onClick={() => {
                            setSelectedFolder(folder);
                            setUploadFolder(folder);
                          }}
                          className={`w-full text-left px-2 py-2 rounded-md text-xs break-all ${
                            folder === selectedFolder
                              ? "bg-accent-dim text-accent border border-accent/20"
                              : "text-text-secondary hover:bg-surface-elevated"
                          }`}
                        >
                          {folder}
                        </button>
                      ))}
                      {folders.length === 0 && (
                        <p className="text-xs text-text-muted">No folders found.</p>
                      )}
                    </div>
                  </aside>

                  <section className="space-y-4">
                    <div className="bg-surface-card border border-border-subtle rounded-2xl p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <form onSubmit={uploadFiles} className="space-y-3">
                        <h3 className="font-display text-lg text-text-primary">Upload Files to Blob</h3>
                        <input
                          value={uploadFolder}
                          onChange={(e) => setUploadFolder(e.target.value)}
                          className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs"
                          placeholder={`${ROOT_PREFIX}/BGIS 2026`}
                        />
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/*"
                          className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs"
                        />
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-4 py-2 rounded-lg bg-accent-dim text-accent text-xs border border-accent/20"
                        >
                          {loading ? "Uploading..." : "Upload Selected Files"}
                        </button>
                      </form>

                      <form onSubmit={handleSaveMapping} className="space-y-3">
                        <h3 className="font-display text-lg text-text-primary">
                          {editor.mode === "create" ? "Create Mapping" : "Edit Mapping"}
                        </h3>
                        <input
                          value={editor.key}
                          onChange={(e) => setEditor((prev) => ({ ...prev, key: e.target.value }))}
                          className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs"
                          placeholder="Mapping key (relative path)"
                        />
                        {editor.mode === "update" && (
                          <input
                            value={editor.newKey}
                            onChange={(e) => setEditor((prev) => ({ ...prev, newKey: e.target.value }))}
                            className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs"
                            placeholder="Optional new key"
                          />
                        )}
                        <input
                          value={editor.url}
                          onChange={(e) => setEditor((prev) => ({ ...prev, url: e.target.value }))}
                          className="w-full rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs"
                          placeholder="Blob URL"
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 rounded-lg bg-accent-dim text-accent text-xs border border-accent/20"
                          >
                            {editor.mode === "create" ? "Create" : "Update"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditor(INITIAL_EDITOR)}
                            className="px-4 py-2 rounded-lg bg-surface-elevated text-text-secondary text-xs border border-border-subtle"
                          >
                            Reset
                          </button>
                        </div>
                      </form>
                    </div>

                    <div className="bg-surface-card border border-border-subtle rounded-2xl p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                        <h3 className="font-display text-lg text-text-primary">Files</h3>
                        <div className="flex items-center gap-2">
                          <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs"
                            placeholder="Search current folder"
                          />
                          <button
                            type="button"
                            onClick={() => void loadMapping()}
                            className="px-3 py-2 rounded-lg bg-surface-elevated text-text-secondary text-xs border border-border-subtle"
                          >
                            Refresh
                          </button>
                        </div>
                      </div>

                      <div className="text-xs text-text-muted mb-4">
                        Total files: {mapping?.totalFiles ?? 0} • Current folder: {selectedFolder}
                      </div>

                      {error && <p className="text-xs text-rose-400 mb-2">{error}</p>}
                      {notice && <p className="text-xs text-emerald-400 mb-2">{notice}</p>}

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                        {visibleEntries.map(([key, url]) => (
                          <article
                            key={key}
                            className="border border-border-subtle bg-surface-elevated rounded-xl overflow-hidden"
                          >
                            <div className="relative h-40 bg-black/20">
                              <Image
                                src={url}
                                alt={key}
                                fill
                                className="object-contain object-top"
                                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                              />
                            </div>
                            <div className="p-3 space-y-2">
                              <p className="text-[11px] text-text-primary break-all">{key}</p>
                              <p className="text-[10px] text-text-muted break-all">{url}</p>
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditor({
                                      key,
                                      newKey: key,
                                      url,
                                      mode: "update",
                                    })
                                  }
                                  className="px-2 py-1 rounded border border-border-subtle bg-surface-card text-text-secondary text-[11px]"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => void mutateMapping("delete", { key })}
                                  className="px-2 py-1 rounded border border-rose-500/30 bg-rose-500/10 text-rose-400 text-[11px]"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>

                      {visibleEntries.length === 0 && (
                        <p className="text-xs text-text-muted">No files in this folder.</p>
                      )}
                    </div>
                  </section>
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-[260px_1fr] gap-4">
                  <aside className="bg-surface-card border border-border-subtle rounded-2xl p-3">
                    <h2 className="font-display text-lg text-text-primary mb-3">Tables</h2>
                    <div className="space-y-1">
                      {DB_TABLES.map((table) => (
                        <button
                          key={table}
                          type="button"
                          onClick={() => {
                            setSelectedTable(table);
                            setSelectedRowId("");
                            setDbMode("create");
                            setRowEditor("{\n  \"id\": \"\"\n}");
                          }}
                          className={`w-full text-left px-2 py-2 rounded-md text-xs ${
                            table === selectedTable
                              ? "bg-accent-dim text-accent border border-accent/20"
                              : "text-text-secondary hover:bg-surface-elevated"
                          }`}
                        >
                          {table}
                        </button>
                      ))}
                    </div>
                  </aside>

                  <section className="space-y-4">
                    <div className="bg-surface-card border border-border-subtle rounded-2xl p-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void loadDbRows()}
                        className="px-3 py-2 rounded-lg bg-surface-elevated text-text-secondary text-xs border border-border-subtle"
                      >
                        Refresh Rows
                      </button>
                      <button
                        type="button"
                        onClick={() => void loadDbHealth()}
                        className="px-3 py-2 rounded-lg bg-surface-elevated text-text-secondary text-xs border border-border-subtle"
                      >
                        Refresh Health
                      </button>
                      <button
                        type="button"
                        onClick={startCreateRow}
                        className="px-3 py-2 rounded-lg bg-accent-dim text-accent text-xs border border-accent/20"
                      >
                        New Row
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteDbRow()}
                        className="px-3 py-2 rounded-lg bg-rose-500/10 text-rose-400 text-xs border border-rose-500/30"
                      >
                        Delete Selected
                      </button>
                    </div>

                    {error && <p className="text-xs text-rose-400">{error}</p>}
                    {notice && <p className="text-xs text-emerald-400">{notice}</p>}

                    <div className="bg-surface-card border border-border-subtle rounded-2xl p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <h3 className="font-display text-lg text-text-primary">DB Setup Checklist</h3>
                        <div className="flex gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider border ${
                              dbHealth?.schemaReady
                                ? "border-emerald-500/30 text-emerald-300 bg-emerald-500/10"
                                : "border-amber-500/30 text-amber-300 bg-amber-500/10"
                            }`}
                          >
                            Schema {dbHealth?.schemaReady ? "Ready" : "Missing"}
                          </span>
                          <span
                            className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider border ${
                              dbHealth?.seeded
                                ? "border-emerald-500/30 text-emerald-300 bg-emerald-500/10"
                                : "border-amber-500/30 text-amber-300 bg-amber-500/10"
                            }`}
                          >
                            Seed {dbHealth?.seeded ? "Ready" : "Pending"}
                          </span>
                          <span
                            className={`px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider border ${
                              dbHealth?.fallbackActive
                                ? "border-sky-500/30 text-sky-300 bg-sky-500/10"
                                : "border-border-subtle text-text-muted bg-surface-elevated"
                            }`}
                          >
                            Fallback {dbHealth?.fallbackActive ? "Active" : "Off"}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                        <div className="rounded-xl border border-border-subtle bg-surface-elevated p-3">
                          <p className="text-[11px] text-text-muted uppercase tracking-wider">tournaments</p>
                          <p className="font-display text-2xl text-text-primary">
                            {dbHealth?.tableCounts?.tournaments ?? 0}
                          </p>
                        </div>
                        <div className="rounded-xl border border-border-subtle bg-surface-elevated p-3">
                          <p className="text-[11px] text-text-muted uppercase tracking-wider">players</p>
                          <p className="font-display text-2xl text-text-primary">
                            {dbHealth?.tableCounts?.players ?? 0}
                          </p>
                        </div>
                        <div className="rounded-xl border border-border-subtle bg-surface-elevated p-3">
                          <p className="text-[11px] text-text-muted uppercase tracking-wider">eras</p>
                          <p className="font-display text-2xl text-text-primary">
                            {dbHealth?.tableCounts?.eras ?? 0}
                          </p>
                        </div>
                      </div>

                      <ul className="space-y-1.5 text-xs text-text-secondary">
                        <li>
                          {dbHealth?.setupChecklist?.schemaApplied ? "✅" : "⬜"} Apply
                          <code className="mx-1">supabase/schema.sql</code> in Supabase SQL editor.
                        </li>
                        <li>
                          {dbHealth?.setupChecklist?.seedRun ? "✅" : "⬜"} Run
                          <code className="mx-1">npm run db:migrate:supabase</code>.
                        </li>
                        <li>
                          {dbHealth?.setupChecklist?.keyTablesReady ? "✅" : "⬜"} Verify rows in
                          key tables.
                        </li>
                      </ul>

                      {!!dbHealth?.tableErrors && Object.keys(dbHealth.tableErrors).length > 0 && (
                        <div className="mt-3 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3">
                          <p className="text-xs text-rose-300 mb-2">Table errors</p>
                          <div className="space-y-1">
                            {Object.entries(dbHealth.tableErrors).map(([table, tableError]) => (
                              <p key={table} className="text-[11px] text-rose-200 break-all">
                                <span className="text-rose-300">{table}:</span> {tableError}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="bg-surface-card border border-border-subtle rounded-2xl p-4">
                        <h3 className="font-display text-lg text-text-primary mb-3">
                          Rows ({dbRows.length}) • {selectedTable}
                        </h3>
                        <div className="max-h-[55vh] overflow-auto space-y-1">
                          {dbRows.map((row, index) => (
                            <button
                              key={String(row.id ?? `${selectedTable}-${index}`)}
                              type="button"
                              onClick={() => selectRow(row)}
                              className={`w-full text-left px-3 py-2 rounded-md border text-xs ${
                                String(row.id ?? "") === selectedRowId
                                  ? "border-accent/30 bg-accent-dim text-accent"
                                  : "border-border-subtle bg-surface-elevated text-text-secondary"
                              }`}
                            >
                              <span className="block truncate">{String(row.id ?? "no-id")}</span>
                            </button>
                          ))}
                          {dbRows.length === 0 && (
                            <p className="text-xs text-text-muted">No rows found.</p>
                          )}
                        </div>
                      </div>

                      <form
                        onSubmit={saveDbRow}
                        className="bg-surface-card border border-border-subtle rounded-2xl p-4 space-y-3"
                      >
                        <h3 className="font-display text-lg text-text-primary">
                          {dbMode === "create" ? "Create Row" : `Edit Row (${selectedRowId})`}
                        </h3>
                        <textarea
                          value={rowEditor}
                          onChange={(e) => setRowEditor(e.target.value)}
                          className="w-full h-[420px] rounded-lg border border-border-subtle bg-surface-elevated px-3 py-2 text-xs font-mono"
                        />
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-4 py-2 rounded-lg bg-accent-dim text-accent text-xs border border-accent/20"
                        >
                          {dbMode === "create" ? "Create Row" : "Update Row"}
                        </button>
                      </form>
                    </div>
                  </section>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
