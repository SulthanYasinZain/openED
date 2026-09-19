import { fireEvent, render, screen } from "@testing-library/react";
import { loginAction } from "@/app/actions/auth";
import LoginPage from "./page";

jest.mock("@/app/actions/auth", () => ({
  loginAction: jest.fn(),
}));

const mockedLoginAction = loginAction as jest.Mock;

describe("LoginPage", () => {
  beforeEach(() => {
    mockedLoginAction.mockReset();
    mockedLoginAction.mockResolvedValue({ error: "" });
  });

  it("renders the email field, password field, and submit button", () => {
    render(<LoginPage />);

    expect(screen.getByPlaceholderText("email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("email")).toHaveAttribute(
      "type",
      "email",
    );
    const passwordInput = document.querySelector('input[name="password"]');
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(screen.getByRole("button", { name: "Submit" })).toBeInTheDocument();
  });

  it("submits the entered credentials to loginAction", async () => {
    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("email"), {
      target: { value: "admin@example.com" },
    });
    const passwordInput = document.querySelector(
      'input[name="password"]',
    ) as HTMLInputElement;
    fireEvent.change(passwordInput, {
      target: { value: "secret123" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    expect(mockedLoginAction).toHaveBeenCalledTimes(1);

    const formData = mockedLoginAction.mock.calls[0][1] as FormData;
    expect(formData.get("email")).toBe("admin@example.com");
    expect(formData.get("password")).toBe("secret123");
  });

  it("displays the error returned by loginAction", async () => {
    mockedLoginAction.mockResolvedValue({ error: "Invalid credentials" });

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText("email"), {
      target: { value: "admin@example.com" },
    });
    const passwordInput = document.querySelector(
      'input[name="password"]',
    ) as HTMLInputElement;
    fireEvent.change(passwordInput, {
      target: { value: "wrong" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
  });
});
