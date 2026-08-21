import { readCookie } from "./oidc/cookies";
import { internalBase, oidcEnabled } from "./oidc/env";

export type TalentRole = "candidate" | "employer" | "admin";

export type OrgMembership = {
  orgId: string;
  orgName: string;
  role: string;
};

export type DevSession = {
  sub: string;
  role: TalentRole;
  orgId: string;
  organizations: OrgMembership[];
  accessToken?: string;
  devMode: boolean;
};

const DEMO_ORGS: OrgMembership[] = [
  { orgId: "org-demo-a", orgName: "Demo Org A", role: "owner" },
  { orgId: "org-demo-b", orgName: "Demo Org B", role: "member" },
];

export function parseDevSession(input: { user?: string; role?: string }): { sub: string; role: TalentRole } | null {
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

/** Acting user from ?user= plus org from cookie (dev) or IdP userinfo (OIDC). */
export async function loadTalentSession(input: {
  user?: string;
  role?: string;
}): Promise<DevSession | null> {
  const parsed = parseDevSession(input);
  if (!parsed) {
    return null;
  }

  if (!oidcEnabled()) {
    const saved = (await readCookie("dev_org")) || "";
    const orgId = saved || DEMO_ORGS[0].orgId;
    return {
      ...parsed,
      orgId,
      organizations: DEMO_ORGS,
      devMode: true,
    };
  }

  const access = await readCookie("rp_access");
  if (!access) {
    const saved = (await readCookie("dev_org")) || "";
    return {
      ...parsed,
      orgId: saved || DEMO_ORGS[0].orgId,
      organizations: DEMO_ORGS,
      devMode: true,
    };
  }

  const res = await fetch(`${internalBase()}/userinfo`, {
    headers: { Authorization: `Bearer ${access}` },
    cache: "no-store",
  });
  if (!res.ok) {
    return {
      ...parsed,
      orgId: DEMO_ORGS[0].orgId,
      organizations: DEMO_ORGS,
      accessToken: access,
      devMode: false,
    };
  }
  const ui = (await res.json()) as {
    org_id?: string;
    organizations?: { org_id?: string; org_name?: string; role?: string }[];
  };
  const organizations = (ui.organizations || [])
    .filter((o) => o.org_id)
    .map((o) => ({
      orgId: String(o.org_id),
      orgName: String(o.org_name || o.org_id),
      role: String(o.role || "member"),
    }));
  const orgs = organizations.length > 0 ? organizations : DEMO_ORGS;
  return {
    ...parsed,
    orgId: ui.org_id ? String(ui.org_id) : orgs[0].orgId,
    organizations: orgs,
    accessToken: access,
    devMode: false,
  };
}

export function sessionQuery(
  session: Pick<DevSession, "sub" | "role">,
  extra: Record<string, string | undefined> = {},
): string {
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
