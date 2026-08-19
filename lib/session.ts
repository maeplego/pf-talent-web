export type TalentRole = "candidate" | "employer" | "admin";

export type DevSession = {
  sub: string;
  role: TalentRole;
};

export function parseDevSession(input: { user?: string; role?: string }): DevSession | null {
  const sub = input.user?.trim();
  if (!sub) {
    return null;
  }
  if (input.role === "candidate" || input.role === "employer" || input.role === "admin") {
    return { sub, role: input.role };
  }
  if (sub.startsWith("employer")) {
    return { sub, role: "employer" };
  }
  if (sub.startsWith("admin")) {
    return { sub, role: "admin" };
  }
  return { sub, role: "candidate" };
}

export function sessionQuery(session: DevSession, extra: Record<string, string | undefined> = {}): string {
  const params = new URLSearchParams();
  params.set("user", session.sub);
  params.set("role", session.role);
  for (const [key, value] of Object.entries(extra)) {
    if (value !== undefined && value !== "") {
      params.set(key, value);
    }
  }
  return `?${params.toString()}`;
}
