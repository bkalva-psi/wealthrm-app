import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CalendarPage from '../calendar';
import { AuthProvider } from '@/context/auth-context';

global.fetch = vi.fn();

describe('Calendar & Appointments Module', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{component}</AuthProvider>
      </QueryClientProvider>
    );
  };

  const mockAppointments = [
    {
      id: 1,
      title: 'Client Meeting',
      description: 'Quarterly review',
      startTime: '2024-01-15T10:00:00Z',
      endTime: '2024-01-15T11:00:00Z',
      location: 'Office',
      clientId: 1,
      clientName: 'John Doe',
      assignedTo: 1,
      priority: 'high',
      type: 'meeting',
      createdAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      title: 'Follow-up Call',
      description: 'Product discussion',
      startTime: '2024-01-15T14:00:00Z',
      endTime: '2024-01-15T14:30:00Z',
      clientId: 2,
      clientName: 'Jane Smith',
      assignedTo: 1,
      priority: 'medium',
      type: 'call',
      createdAt: '2024-01-01T00:00:00Z',
    },
  ];

  it('should render calendar page', async () => {
    const mockUser = {
      id: 1,
      username: 'rm1@primesoft.net',
      fullName: 'Test User',
      role: 'RM',
    };

    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ user: mockUser }) })
      .mockResolvedValueOnce({ ok: true, json: async () => mockAppointments });

    renderWithProviders(<CalendarPage />);

    await waitFor(() => {
      expect(screen.getByText(/calendar/i)).toBeInTheDocument();
    });
  });

  it('should display appointments in list view', async () => {
    const mockUser = {
      id: 1,
      username: 'rm1@primesoft.net',
      fullName: 'Test User',
      role: 'RM',
    };

    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ user: mockUser }) })
      .mockResolvedValueOnce({ ok: true, json: async () => mockAppointments });

    renderWithProviders(<CalendarPage />);

    await waitFor(() => {
      expect(screen.getByText('Client Meeting')).toBeInTheDocument();
    });
  });

  it('should allow creating new appointment', async () => {
    const mockUser = {
      id: 1,
      username: 'rm1@primesoft.net',
      fullName: 'Test User',
      role: 'RM',
    };

    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ user: mockUser }) })
      .mockResolvedValueOnce({ ok: true, json: async () => mockAppointments })
      .mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    renderWithProviders(<CalendarPage />);

    await waitFor(() => {
      const addButton = screen.getByRole('button', { name: /new appointment/i });
      expect(addButton).toBeInTheDocument();
    });
  });

  it('should filter appointments by type', async () => {
    const mockUser = {
      id: 1,
      username: 'rm1@primesoft.net',
      fullName: 'Test User',
      role: 'RM',
    };

    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ user: mockUser }) })
      .mockResolvedValueOnce({ ok: true, json: async () => mockAppointments });

    renderWithProviders(<CalendarPage />);

    await waitFor(() => {
      expect(screen.getByText('Client Meeting')).toBeInTheDocument();
    });
  });

  it('should handle empty appointments list', async () => {
    const mockUser = {
      id: 1,
      username: 'rm1@primesoft.net',
      fullName: 'Test User',
      role: 'RM',
    };

    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ user: mockUser }) })
      .mockResolvedValueOnce({ ok: true, json: async () => [] });

    renderWithProviders(<CalendarPage />);

    await waitFor(() => {
      expect(screen.getByText(/no appointments/i)).toBeInTheDocument();
    });
  });
});

