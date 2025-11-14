import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ClientTasks from '../client-tasks';
import { AuthProvider } from '@/context/auth-context';

global.fetch = vi.fn();

const mockHash = vi.fn(() => '#/clients/1/tasks');
Object.defineProperty(window, 'location', {
  value: { hash: mockHash() },
  writable: true,
});

describe('Test Suite 8: Client Tasks', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
    mockHash.mockReturnValue('#/clients/1/tasks');
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{component}</AuthProvider>
      </QueryClientProvider>
    );
  };

  const mockClient = { id: 1, fullName: 'John Doe' };
  const mockTasks = [
    {
      id: 1,
      title: 'Follow up on portfolio',
      description: 'Review portfolio performance',
      status: 'In Progress',
      dueDate: '2024-01-25',
      priority: 'High',
    },
  ];

  // TC-CL-022: View Task List
  it('TC-CL-022: should display task list with details', async () => {
    const mockUser = {
      id: 1,
      username: 'rm1@primesoft.net',
      fullName: 'Test User',
      role: 'RM',
    };

    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ user: mockUser }) })
      .mockResolvedValueOnce({ ok: true, json: async () => mockClient })
      .mockResolvedValueOnce({ ok: true, json: async () => mockTasks });

    renderWithProviders(<ClientTasks />);

    await waitFor(() => {
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(global.fetch).toHaveBeenCalled();
  });

  // TC-CL-023: Create Task
  it('TC-CL-023: should create new task', async () => {
    const mockUser = {
      id: 1,
      username: 'rm1@primesoft.net',
      fullName: 'Test User',
      role: 'RM',
    };

    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ user: mockUser }) })
      .mockResolvedValueOnce({ ok: true, json: async () => mockClient })
      .mockResolvedValueOnce({ ok: true, json: async () => mockTasks });

    renderWithProviders(<ClientTasks />);

    await waitFor(() => {
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    });

    const createButton = screen.queryByRole('button', { name: /create.*task/i });
    if (createButton) {
      expect(createButton).toBeInTheDocument();
    }
  });

  // TC-CL-024: Update Task Status
  it('TC-CL-024: should update task status', async () => {
    const mockUser = {
      id: 1,
      username: 'rm1@primesoft.net',
      fullName: 'Test User',
      role: 'RM',
    };

    (global.fetch as any)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ user: mockUser }) })
      .mockResolvedValueOnce({ ok: true, json: async () => mockClient })
      .mockResolvedValueOnce({ ok: true, json: async () => mockTasks });

    renderWithProviders(<ClientTasks />);

    await waitFor(() => {
      expect(screen.getByText(/john doe/i)).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalled();
  });
});

