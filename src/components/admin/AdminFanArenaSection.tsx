"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { MOMENT_TEMPLATE_OPTIONS } from "@/lib/fanArena";
import type {
  AdminCommunityBoard,
  CommunityLiveEvent,
  CommunityLiveEventType,
  FanContentStatus,
  FanEngagementRollup,
  MediaMoment,
  MediaMomentTemplateKey,
} from "@/data/types";

const statusOptions: FanContentStatus[] = ["draft", "published", "pinned", "expired", "archived"];
const eventTypeOptions: CommunityLiveEventType[] = ["announcement", "score_update", "poll", "moment", "countdown"];

export default function AdminFanArenaSection({
  authHeaders,
  boards,
}: {
  authHeaders: Record<string, string>;
  boards: AdminCommunityBoard[];
}) {
  const [liveEvents, setLiveEvents] = useState<CommunityLiveEvent[]>([]);
  const [moments, setMoments] = useState<MediaMoment[]>([]);
  const [engagement, setEngagement] = useState<FanEngagementRollup[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [eventTitle, setEventTitle] = useState("");
  const [eventBody, setEventBody] = useState("");
  const [eventBoardId, setEventBoardId] = useState("");
  const [eventType, setEventType] = useState<CommunityLiveEventType>("announcement");
  const [eventStatus, setEventStatus] = useState<FanContentStatus>("draft");

  const [momentTitle, setMomentTitle] = useState("");
  const [momentDescription, setMomentDescription] = useState("");
  const [momentBoardId, setMomentBoardId] = useState("");
  const [momentTemplate, setMomentTemplate] = useState<MediaMomentTemplateKey>("trophy_pulse");
  const [momentStatus, setMomentStatus] = useState<FanContentStatus>("draft");

  const momentTournamentId = useMemo(
    () => boards.find((board) => board.id === momentBoardId)?.tournamentId ?? null,
    [boards, momentBoardId]
  );

  const loadFanArena = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [eventsResponse, momentsResponse] = await Promise.all([
        fetch("/api/admin/community/live-events", { headers: authHeaders }),
        fetch("/api/admin/moments", { headers: authHeaders }),
      ]);

      const eventsData = (await eventsResponse.json()) as {
        liveEvents?: CommunityLiveEvent[];
        engagement?: FanEngagementRollup[];
        error?: string;
      };
      const momentsData = (await momentsResponse.json()) as { moments?: MediaMoment[]; error?: string };

      if (!eventsResponse.ok) {
        throw new Error(eventsData.error || "Could not load live events.");
      }
      if (!momentsResponse.ok) {
        throw new Error(momentsData.error || "Could not load moments.");
      }

      setLiveEvents(eventsData.liveEvents ?? []);
      setEngagement(eventsData.engagement ?? []);
      setMoments(momentsData.moments ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load Fan Arena controls.");
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    void loadFanArena();
  }, [loadFanArena]);

  async function createLiveEvent() {
    if (!eventTitle.trim()) {
      setError("Live event title is required.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");
    try {
      const selectedBoard = boards.find((board) => board.id === eventBoardId);
      const response = await fetch("/api/admin/community/live-events", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          title: eventTitle,
          body: eventBody,
          boardId: eventBoardId || null,
          tournamentId: selectedBoard?.tournamentId ?? null,
          eventType,
          status: eventStatus,
          isPinned: eventStatus === "pinned",
        }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Could not create live event.");
      }

      setEventTitle("");
      setEventBody("");
      setNotice("Live pulse saved.");
      await loadFanArena();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create live event.");
    } finally {
      setSaving(false);
    }
  }

  async function createMoment() {
    if (!momentTitle.trim()) {
      setError("Moment title is required.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/moments", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          title: momentTitle,
          description: momentDescription,
          tournamentId: momentTournamentId,
          templateKey: momentTemplate,
          status: momentStatus,
          accent: momentTemplate === "trophy_pulse" ? "gold" : momentTemplate === "match_countdown" ? "energy" : "cyan",
          durationSeconds: 18,
        }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || "Could not create moment.");
      }

      setMomentTitle("");
      setMomentDescription("");
      setNotice("Moment saved.");
      await loadFanArena();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create moment.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="archive-panel rounded-[28px] p-5 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-kicker">Fan Arena OS</p>
          <h2 className="font-display text-3xl uppercase leading-none text-white md:text-5xl">
            Live + Moment Controls
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-text-secondary">
            Publish verified live pulses, fan prompts, and Remotion-ready moments. Drafts stay hidden until
            published or pinned.
          </p>
        </div>
        <button type="button" className="button-secondary" onClick={() => void loadFanArena()}>
          {loading ? "Refreshing..." : "Refresh Arena"}
        </button>
      </div>

      {error ? (
        <div className="mt-5 rounded-[20px] border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200">
          {error}
        </div>
      ) : null}
      {notice ? (
        <div className="mt-5 rounded-[20px] border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          {notice}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Create live pulse</p>
          <div className="mt-4 grid gap-3">
            <input
              value={eventTitle}
              onChange={(event) => setEventTitle(event.target.value)}
              className="rounded-[14px] border border-white/10 bg-black/20 px-3 py-3 text-sm text-white"
              placeholder="Example: Finals lobby is live"
            />
            <textarea
              value={eventBody}
              onChange={(event) => setEventBody(event.target.value)}
              className="min-h-24 rounded-[14px] border border-white/10 bg-black/20 px-3 py-3 text-sm text-white"
              placeholder="Verified update, prompt, score note, or context."
            />
            <div className="grid gap-3 md:grid-cols-3">
              <select
                value={eventBoardId}
                onChange={(event) => setEventBoardId(event.target.value)}
                className="rounded-[14px] border border-white/10 bg-black/20 px-3 py-3 text-sm text-white"
              >
                <option value="">No board link</option>
                {boards.map((board) => (
                  <option key={board.id} value={board.id}>
                    {board.tournamentName}
                  </option>
                ))}
              </select>
              <select
                value={eventType}
                onChange={(event) => setEventType(event.target.value as CommunityLiveEventType)}
                className="rounded-[14px] border border-white/10 bg-black/20 px-3 py-3 text-sm text-white"
              >
                {eventTypeOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <select
                value={eventStatus}
                onChange={(event) => setEventStatus(event.target.value as FanContentStatus)}
                className="rounded-[14px] border border-white/10 bg-black/20 px-3 py-3 text-sm text-white"
              >
                {statusOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <button type="button" onClick={() => void createLiveEvent()} disabled={saving} className="button-primary">
              {saving ? "Saving..." : "Save Live Pulse"}
            </button>
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Create Soul Moment</p>
          <div className="mt-4 grid gap-3">
            <input
              value={momentTitle}
              onChange={(event) => setMomentTitle(event.target.value)}
              className="rounded-[14px] border border-white/10 bg-black/20 px-3 py-3 text-sm text-white"
              placeholder="Example: Trophy pulse reveal"
            />
            <textarea
              value={momentDescription}
              onChange={(event) => setMomentDescription(event.target.value)}
              className="min-h-24 rounded-[14px] border border-white/10 bg-black/20 px-3 py-3 text-sm text-white"
              placeholder="Short subtitle for the embedded Remotion composition."
            />
            <div className="grid gap-3 md:grid-cols-3">
              <select
                value={momentBoardId}
                onChange={(event) => setMomentBoardId(event.target.value)}
                className="rounded-[14px] border border-white/10 bg-black/20 px-3 py-3 text-sm text-white"
              >
                <option value="">No tournament link</option>
                {boards.map((board) => (
                  <option key={board.id} value={board.id}>
                    {board.tournamentName}
                  </option>
                ))}
              </select>
              <select
                value={momentTemplate}
                onChange={(event) => setMomentTemplate(event.target.value as MediaMomentTemplateKey)}
                className="rounded-[14px] border border-white/10 bg-black/20 px-3 py-3 text-sm text-white"
              >
                {MOMENT_TEMPLATE_OPTIONS.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label}
                  </option>
                ))}
              </select>
              <select
                value={momentStatus}
                onChange={(event) => setMomentStatus(event.target.value as FanContentStatus)}
                className="rounded-[14px] border border-white/10 bg-black/20 px-3 py-3 text-sm text-white"
              >
                {statusOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <button type="button" onClick={() => void createMoment()} disabled={saving} className="button-primary">
              {saving ? "Saving..." : "Save Moment"}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-3">
        <div className="rounded-[22px] border border-white/10 bg-black/15 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-text-muted">Today</p>
          {engagement[0] ? (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <AdminMetric label="Votes" value={engagement[0].votesCount} />
              <AdminMetric label="Reactions" value={engagement[0].reactionsCount} />
              <AdminMetric label="Users" value={engagement[0].activeUsersCount} />
              <AdminMetric label="Badges" value={engagement[0].badgesAwardedCount} />
            </div>
          ) : (
            <p className="mt-3 text-sm text-text-muted">No engagement data yet.</p>
          )}
        </div>

        <RecentList
          title="Recent live pulses"
          empty="No live pulses yet."
          items={liveEvents.map((event) => ({
            id: event.id,
            title: event.title,
            meta: `${event.eventType} • ${event.status}`,
          }))}
        />
        <RecentList
          title="Recent moments"
          empty="No moments yet."
          items={moments.map((moment) => ({
            id: moment.id,
            title: moment.title,
            meta: `${moment.templateKey} • ${moment.status}`,
          }))}
        />
      </div>
    </section>
  );
}

function AdminMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[16px] border border-white/10 bg-white/[0.03] p-3">
      <p className="font-display text-2xl leading-none text-white">{value}</p>
      <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-text-muted">{label}</p>
    </div>
  );
}

function RecentList({
  title,
  empty,
  items,
}: {
  title: string;
  empty: string;
  items: Array<{ id: string; title: string; meta: string }>;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-black/15 p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-text-muted">{title}</p>
      <div className="mt-3 space-y-2">
        {items.length ? (
          items.slice(0, 5).map((item) => (
            <div key={item.id} className="rounded-[14px] border border-white/10 bg-white/[0.03] p-3">
              <p className="text-sm font-medium text-white">{item.title}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-text-muted">{item.meta}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-text-muted">{empty}</p>
        )}
      </div>
    </div>
  );
}
