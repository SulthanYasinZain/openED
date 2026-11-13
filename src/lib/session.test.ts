/** @jest-environment node */
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { checkSession, verifyAccessToken } from "./session";

jest.mock("jose", () => ({ jwtVerify: jest.fn() }));
jest.mock("next/headers", () => ({ cookies: jest.fn() }));
jest.mock("next/navigation", () => ({ redirect: jest.fn() }));
const originalSecret = process.env.JWT_SECRET;
const get = jest.fn();
beforeEach(() => {
  jest.resetAllMocks();
  process.env.JWT_SECRET = "unit-test-secret";
  (cookies as jest.Mock).mockResolvedValue({ get });
  get.mockReturnValue({ value: "valid-token" });
  (jwtVerify as jest.Mock).mockResolvedValue({
    payload: { userId: 42, role: "ADMIN" },
  });
  (redirect as unknown as jest.Mock).mockImplementation((path) => {
    throw new Error(`redirect:${path}`);
  });
});
afterAll(() => {
  if (originalSecret === undefined) delete process.env.JWT_SECRET;
  else process.env.JWT_SECRET = originalSecret;
});

it("allows an authenticated administrator", async () => {
  expect(await checkSession("ADMIN")).toEqual({ userId: 42, role: "ADMIN" });
  expect(get).toHaveBeenCalledWith("access_token");
  expect(jwtVerify).toHaveBeenCalledWith(
    "valid-token",
    new TextEncoder().encode("unit-test-secret"),
    { algorithms: ["HS256"] },
  );
  expect(redirect).not.toHaveBeenCalled();
});
it("redirects visitors with no token to login", async () => {
  get.mockReturnValue(undefined);
  await expect(checkSession("ADMIN")).rejects.toThrow("redirect:/login");
  expect(jwtVerify).not.toHaveBeenCalled();
});
it.each(["STUDENT", "MENTOR", "SCHOOL"])(
  "denies admin access to %s",
  async (role) => {
    (jwtVerify as jest.Mock).mockResolvedValue({
      payload: { userId: 42, role },
    });
    await expect(checkSession("ADMIN")).rejects.toThrow("redirect:/");
    expect(redirect).toHaveBeenCalledWith("/");
  },
);
it("redirects expired or invalid tokens to login", async () => {
  (jwtVerify as jest.Mock).mockRejectedValue(new Error("expired"));
  await expect(checkSession("ADMIN")).rejects.toThrow("redirect:/login");
});
it.each([
  { role: "ADMIN" },
  { userId: "42", role: "ADMIN" },
  { userId: 42, role: "OWNER" },
  { userId: 42, role: 1 },
])("rejects malformed token claims %j", async (payload) => {
  (jwtVerify as jest.Mock).mockResolvedValue({ payload });
  await expect(verifyAccessToken("token")).rejects.toThrow(/Invalid/);
  await expect(checkSession("ADMIN")).rejects.toThrow("redirect:/login");
});
it("fails closed when the JWT secret is missing", async () => {
  delete process.env.JWT_SECRET;
  await expect(checkSession("ADMIN")).rejects.toThrow("redirect:/login");
  expect(jwtVerify).not.toHaveBeenCalled();
});
