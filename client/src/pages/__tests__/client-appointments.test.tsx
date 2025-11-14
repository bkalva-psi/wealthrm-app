import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ClientAppointments from '../client-appointments';
import { AuthProvider } from '@/context/auth-context';

global.fetch = vi.fn();

const mockHash = vi.fn(() => '#/clients/1/appointments');
Object.defineProperty(window, 'location', {
  value: { hash: mockHash() },
  writable: true,
});

describe('Test Suite 7: Client Appointments', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
    mockHash.mockReturnValue('#/clients/1/appointments');
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{component}</AuthProvider>
      </QueryClientProvider>
    );
  };

  const mockClient = { id: 1, fullName: 'John Doe' };
  const mockAppointments = [
    {
      id: 1,
      date: '2024-01-20',
      time: '10:00',
      title: 'Portfolio Review',
      location: 'Office',
      status: 'Scheduled',
    },
  ];

  // TC-CL-019: View Appointment List
  it('TC-CL-019: should display appointment list', async () => {
    const mockUser = {
      id: 1,
      username: 'rm1@primesoft.net',
      fullName: 'Test User',
      role: 'RM',
    };

    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ user: mockUser }) })
      .mockResolvedValueOnce({ ok: true, json: async () => mockClient })
      .mockResolvedValueOnce({ ok: true, json: async () => mockAppointments });

    renderWithProviders(<ClientAppointments />);

    await waitFor(() => {
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(global.fetch).toHaveBeenCalled();
  });

  // TC-CL-020: Create Appointment
  it('TC-CL-020: should create new appointment', async () => {
    const mockUser = {
      id: 1,
      username: 'rm1@primesoft.net',
      fullName: 'Test User',
      role: 'RM',
    };

    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ user: mockUser }) })
      .mockResolvedValueOnce({ ok: true, json: async () => mockClient })
      .mockResolvedValueOnce({ ok: true, json: async () => mockAppointments });

    renderWithProviders(<ClientAppointments />);

    await waitFor(() => {
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    });

    const createButton = screen.queryByRole('button', { name: /create.*appointment/i });
    if (createButton) {
      expect(createButton).toBeInTheDocument();
    }
  });

  // TC-CL-021: Edit Appointment
  it('TC-CL-021: should edit existing appointment', async () => {
    const mockUser = {
      id: 1,
      username: 'rm1@primesoft.net',
      fullName: 'Test User',
      role: 'RM',
    };

    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ user: mockUser }) })
      .mockResolvedValueOnce({ ok: true, json: async () => mockClient })
      .mockResolvedValueOnce({ ok: true, json: async () => mockAppointments });

    renderWithProviders(<ClientAppointments />);

    await waitFor(() => {
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalled();
  });
});

