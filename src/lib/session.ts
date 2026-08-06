import { SignJWT, jwtVerify } from "jose";

export type AuthTokenPayload = {
  userId: string;
  role: "student" | "admin" | "school";
};

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return new TextEncoder().encode(secret);
}

export async function createAccessToken(
  payload: AuthTokenPayload,
): Promise<string> {
  return new SignJWT({
    userId: payload.userId,
    role: payload.role,
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(getJwtSecret());
}

export async function verifyAccessToken(
  token: string,
): Promise<AuthTokenPayload> {
  const { payload } = await jwtVerify(token, getJwtSecret(), {
    algorithms: ["HS256"],
  });

  if (typeof payload.userId !== "number" || typeof payload.role !== "string") {
    throw new Error("Invalid token payload");
  }

  if (
    payload.role !== "STUDENT" &&
    payload.role !== "ADMIN" &&
    payload.role !== "TEACHER"
  ) {
    throw new Error("Invalid user role");
  }

  return {
    userId: payload.userId,
    role: payload.role,
  };
}
