import { talentFetch } from "../lib/api";
import { calendarPublicWebBase, upcomingSlotRange } from "../lib/calendar";
import type { DevSession } from "../lib/session";
import type { InterviewSlotsPayload } from "../lib/types";

export async function InterviewSlots({
  applicationId,
  session,
}: {
  applicationId: string;
  session: DevSession;
}) {
  const { rangeStart, rangeEnd } = upcomingSlotRange();
  const result = await talentFetch<InterviewSlotsPayload>(
    `/v1/applications/${applicationId}/interview-slots?rangeStart=${encodeURIComponent(rangeStart)}&rangeEnd=${encodeURIComponent(rangeEnd)}`,
    session,
  );
  if (!result.ok) {
    if (result.status === 503) {
      return <p>カレンダー未接続</p>;
    }
    return (
      <p role="alert" style={{ color: "#b00020" }}>
        {result.error}
      </p>
    );
  }
  const bookHref = `${calendarPublicWebBase()}/book/${result.data.slug}`;
  return (
    <div>
      <p>
        面接枠（P05）: <a href={bookHref}>{bookHref}</a>
      </p>
      {result.data.starts.length === 0 ? (
        <p>表示期間に空き枠はありません。</p>
      ) : (
        <ul>
          {result.data.starts.map((start) => (
            <li key={start}>{start}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
