import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LoginPage from '../login';
import { AuthProvider } from '@/context/auth-context';

// Mock fetch globally
global.fetch = vi.fn();

// Mock window.location.hash
const mockHash = vi.fn();
Object.defineProperty(window, 'location', {
  value: {
    hash: '',
    replace: mockHash,
  },
  writable: true,
});

describe('Authentication Module', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
    localStorage.clear();
    mockHash.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{component}</AuthProvider>
      </QueryClientProvider>
    );
  };

  describe('Login Page', () => {
    it('should render login form with all required fields', () => {
      renderWithProviders(<LoginPage />);

      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /remember/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('should auto-populate credentials in development mode', () => {
      renderWithProviders(<LoginPage />);

      const usernameInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;

      expect(usernameInput.value).toBe('rm1@primesoft.net');
      expect(passwordInput.value).toBe('password@123');
    });

    it('should load saved credentials from localStorage', () => {
      const savedCredentials = {
        username: 'saved@example.com',
        password: 'savedpassword',
      };
      localStorage.setItem('wealthforce_credentials', JSON.stringify(savedCredentials));

      renderWithProviders(<LoginPage />);

      const usernameInput = screen.getByLabelText(/email address/i) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;

      expect(usernameInput.value).toBe(savedCredentials.username);
      expect(passwordInput.value).toBe(savedCredentials.password);
    });

    it('should toggle password visibility', () => {
      renderWithProviders(<LoginPage />);

      const passwordInput = screen.getByLabelText(/password/i) as HTMLInputElement;
      const toggleButton = screen.getByRole('button', { name: '' });

      expect(passwordInput.type).toBe('password');
      
      fireEvent.click(toggleButton);
      expect(passwordInput.type).toBe('text');
      
      fireEvent.click(toggleButton);
      expect(passwordInput.type).toBe('password');
    });

    it('should handle form submission with valid credentials', async () => {
      const mockUser = {
        id: 1,
        username: 'rm1@primesoft.net',
        fullName: 'Test User',
        role: 'RM',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser }),
      });

      renderWithProviders(<LoginPage />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/auth/login'),
          expect.objectContaining({
            method: 'POST',
          })
        );
      });
    });

    it('should display error message on login failure', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Invalid credentials'));

      renderWithProviders(<LoginPage />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid username or password/i)).toBeInTheDocument();
      });
    });

    it('should save credentials when remember me is checked', async () => {
      const mockUser = {
        id: 1,
        username: 'rm1@primesoft.net',
        fullName: 'Test User',
        role: 'RM',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser }),
      });

      renderWithProviders(<LoginPage />);

      const rememberCheckbox = screen.getByRole('checkbox', { name: /remember/i });
      fireEvent.click(rememberCheckbox);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const saved = localStorage.getItem('wealthforce_credentials');
        expect(saved).toBeTruthy();
      });
    });

    it('should not save credentials when remember me is unchecked', async () => {
      const mockUser = {
        id: 1,
        username: 'rm1@primesoft.net',
        fullName: 'Test User',
        role: 'RM',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser }),
      });

      renderWithProviders(<LoginPage />);

      const rememberCheckbox = screen.getByRole('checkbox', { name: /remember/i });
      // Uncheck if already checked
      if ((rememberCheckbox as HTMLInputElement).checked) {
        fireEvent.click(rememberCheckbox);
      }

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const saved = localStorage.getItem('wealthforce_credentials');
        expect(saved).toBeNull();
      });
    });

    it('should disable form fields during authentication', async () => {
      (global.fetch as any).mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(() => resolve({ ok: false }), 100))
      );

      renderWithProviders(<LoginPage />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const usernameInput = screen.getByLabelText(/email address/i);
        const passwordInput = screen.getByLabelText(/password/i);
        expect(usernameInput).toBeDisabled();
        expect(passwordInput).toBeDisabled();
        expect(submitButton).toBeDisabled();
      });
    });

    it('should redirect QM users to QM portal after login', async () => {
      const mockUser = {
        id: 1,
        username: 'qm@primesoft.net',
        fullName: 'QM User',
        role: 'Question Manager',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser }),
      });

      renderWithProviders(<LoginPage />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockHash).toHaveBeenCalledWith('#/qm-portal');
      });
    });

    it('should redirect regular users to dashboard after login', async () => {
      const mockUser = {
        id: 1,
        username: 'rm1@primesoft.net',
        fullName: 'RM User',
        role: 'RM',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser }),
      });

      renderWithProviders(<LoginPage />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockHash).toHaveBeenCalledWith('#/');
      });
    });
  });

  describe('Auth Context', () => {
    it('should check authentication status on mount', async () => {
      const mockUser = {
        id: 1,
        username: 'rm1@primesoft.net',
        fullName: 'Test User',
        role: 'RM',
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ user: mockUser }),
      });

      renderWithProviders(<LoginPage />);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/auth/me',
          expect.objectContaining({
            credentials: 'include',
          })
        );
      });
    });

    it('should handle authentication check failure gracefully', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      renderWithProviders(<LoginPage />);

      await waitFor(() => {
        // Should not crash, just log error
        expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      });
    });
  });
});

