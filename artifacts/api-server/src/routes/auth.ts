import * as oidc from "openid-client";
import { Router, type IRouter, type Request, type Response } from "express";
import { GetCurrentAuthUserResponse } from "@workspace/api-zod";
import { db, usersTable } from "@workspace/db";
import {
  clearSession,
  getSessionId,
  createSession,
  SESSION_COOKIE,
  SESSION_TTL,
  type SessionData,
} from "../lib/auth";

const GOOGLE_ISSUER = "https://accounts.google.com";
const OIDC_COOKIE_TTL = 10 * 60 * 1000;

const router: IRouter = Router();

let googleConfig: oidc.Configuration | null = null;

async function getGoogleConfig(): Promise<oidc.Configuration> {
  if (!googleConfig) {
    googleConfig = await oidc.discovery(
      new URL(GOOGLE_ISSUER),
      process.env.GOOGLE_CLIENT_ID!,
      process.env.GOOGLE_CLIENT_SECRET!,
    );
  }
  return googleConfig;
}

function getOrigin(req: Request): string {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers["host"] || "localhost";
  return `${proto}://${host}`;
}

function setSessionCookie(res: Response, sid: string) {
  res.cookie(SESSION_COOKIE, sid, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL,
  });
}

function setOidcCookie(res: Response, name: string, value: string) {
  res.cookie(name, value, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: OIDC_COOKIE_TTL,
  });
}

function getSafeReturnTo(value: unknown): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return "/web/";
  }
  return value;
}

async function upsertUser(claims: Record<string, unknown>) {
  const googleId = `google:${claims.sub as string}`;
  const userData = {
    id: googleId,
    email: (claims.email as string) || null,
    firstName: (claims.given_name as string) || null,
    lastName: (claims.family_name as string) || null,
    profileImageUrl: (claims.picture as string) || null,
  };

  const [user] = await db
    .insert(usersTable)
    .values(userData)
    .onConflictDoUpdate({
      target: usersTable.id,
      set: {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        profileImageUrl: userData.profileImageUrl,
        updatedAt: new Date(),
      },
    })
    .returning();
  return user;
}

// Get current auth state
router.get("/auth/user", (req: Request, res: Response) => {
  res.json(
    GetCurrentAuthUserResponse.parse({
      user: req.isAuthenticated() ? req.user : null,
    }),
  );
});

// Start Google login
router.get("/login", async (req: Request, res: Response) => {
  try {
    const config = await getGoogleConfig();
    const callbackUrl = `${getOrigin(req)}/api/auth/google/callback`;
    const returnTo = getSafeReturnTo(req.query.returnTo);

    const state = oidc.randomState();
    const nonce = oidc.randomNonce();
    const codeVerifier = oidc.randomPKCECodeVerifier();
    const codeChallenge = await oidc.calculatePKCECodeChallenge(codeVerifier);

    const redirectTo = oidc.buildAuthorizationUrl(config, {
      redirect_uri: callbackUrl,
      scope: "openid email profile",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      state,
      nonce,
    });

    setOidcCookie(res, "g_code_verifier", codeVerifier);
    setOidcCookie(res, "g_nonce", nonce);
    setOidcCookie(res, "g_state", state);
    setOidcCookie(res, "g_return_to", returnTo);

    res.redirect(redirectTo.href);
  } catch (err) {
    req.log.error({ err }, "Google login init error");
    res.redirect("/web/?login_error=1");
  }
});

// Google OAuth callback
router.get("/auth/google/callback", async (req: Request, res: Response) => {
  try {
    const config = await getGoogleConfig();
    const callbackUrl = `${getOrigin(req)}/api/auth/google/callback`;

    const codeVerifier = req.cookies?.g_code_verifier;
    const nonce = req.cookies?.g_nonce;
    const expectedState = req.cookies?.g_state;

    res.clearCookie("g_code_verifier", { path: "/" });
    res.clearCookie("g_nonce", { path: "/" });
    res.clearCookie("g_state", { path: "/" });

    if (!codeVerifier || !expectedState) {
      res.redirect("/api/login?returnTo=/web/");
      return;
    }

    const currentUrl = new URL(
      `${callbackUrl}?${new URL(req.url, `http://${req.headers.host}`).searchParams}`,
    );

    const tokens = await oidc.authorizationCodeGrant(config, currentUrl, {
      pkceCodeVerifier: codeVerifier,
      expectedNonce: nonce,
      expectedState,
      idTokenExpected: true,
    });

    const claims = tokens.claims();
    if (!claims) {
      res.redirect("/web/?login_error=1");
      return;
    }

    const returnTo = getSafeReturnTo(req.cookies?.g_return_to);
    res.clearCookie("g_return_to", { path: "/" });

    const dbUser = await upsertUser(claims as unknown as Record<string, unknown>);

    const now = Math.floor(Date.now() / 1000);
    const sessionData: SessionData = {
      user: {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        profileImageUrl: dbUser.profileImageUrl,
      },
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expiresIn() ? now + tokens.expiresIn()! : claims.exp,
    };

    const sid = await createSession(sessionData);
    setSessionCookie(res, sid);
    res.redirect(returnTo);
  } catch (err) {
    req.log.error({ err }, "Google callback error");
    res.redirect("/web/?login_error=1");
  }
});

// Logout
router.get("/logout", async (req: Request, res: Response) => {
  const sid = getSessionId(req);
  await clearSession(res, sid);
  res.redirect("/web/");
});

export default router;
