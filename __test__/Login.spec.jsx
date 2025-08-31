import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { render, screen, waitFor } from "@testing-library/react";
import Login from "../src/components/Login";
import userEvent from "@testing-library/user-event";
import ChatPanel from "../src/components/ChatPanel";
import { wait } from "@testing-library/user-event/dist/cjs/utils/index.js";

// const mockNavigate = vi.fn();
// vi.mock("react-router-dom", async() => {
//   const actual = await vi.importActual("react-router-dom");
//   return{
//     ...actual,
//     useNavigate: () => mockNavigate,
//   };
// });
describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });


  it('renders Login Page without crashing', () => {
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Login/>
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: "Sign in to your account" })).toBeInTheDocument();
    expect(screen.getByRole('button', {name: "Login"}))
  });

  it('should login the user when the credentials are valid', async() => {
    const user = userEvent.setup()
    // Mock a valid API response
    const mockResponse = {
      access: "mock-access-token",
      refresh: "mock-refresh-token",
      fullName: "John Doe",
      userID: "123",
      friendList: ["friend1", "friend2"]
    }
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    render(
       <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/chat_panel" element={<div data-testid="chat-panel">Chat Panel</div>} />
        </Routes>
      </MemoryRouter>
    )

    const usernameInput = screen.getByTestId("userName");
    const passwordInput = screen.getByTestId("userPassword");
    const loginButton = screen.getByTestId("loginBtn");

    await user.type(usernameInput, "testuser");
    await user.type(passwordInput, "testpassword");

    await user.click(loginButton);
    console.log("Hello")
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      console.log("Mock navigate")
    });
    await waitFor(() => {
      expect(screen.getByTestId("chat-panel")).toBeInTheDocument()
    })
    screen.debug()
  })
})