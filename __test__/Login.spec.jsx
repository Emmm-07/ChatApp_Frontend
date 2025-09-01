import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Login from "../src/components/Login";
import userEvent from "@testing-library/user-event";


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
    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
      console.log("Mock api call")
    });
    await waitFor(() => {
      expect(screen.getByTestId("chat-panel")).toBeInTheDocument()
    })
    screen.debug()
  })

  it('should not login the user when invalid credential', async() => {
    const user = userEvent.setup()

    const mockResponse = {
      access: "mock-invalid-access-token",
      refresh: "mock-invalid-refresh-token",
      fullName: "Jane Doe",
      userID: "321",
      friendList: []
    }
    const fetchSpy = vi.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: false,
      json: async () => mockResponse,
    });

    render(
       <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<Login />} />
        </Routes>
      </MemoryRouter>
    )

    
    const usernameInput = screen.getByTestId("userName");
    const passwordInput = screen.getByTestId("userPassword");
    const loginButton = screen.getByTestId("loginBtn");
    const errorMsg = screen.getByTestId("error-msg");

    await user.type(usernameInput, "testuser");
    await user.type(passwordInput, "testpassword");

    await user.click(loginButton);

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(errorMsg).not.toHaveClass("hidden");
    })
    screen.debug()
  }) 
})