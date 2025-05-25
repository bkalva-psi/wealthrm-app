import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from '@/components/ui/input';
import { 
  ChevronLeft, 
  ChevronDown,
  Download,
  ArrowUpDown,
  Filter,
  Search,
  Calendar,
  PieChart,
  BarChart,
  Activity,
  FileText,
  CreditCard,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart as RechartsBarChart, Bar } from 'recharts';

// Transaction Types
type TransactionType = 'buy' | 'sell' | 'dividend' | 'interest' | 'fee' | 'deposit' | 'withdrawal';
type ProductType = 'equity' | 'mutual_fund' | 'bond' | 'fixed_deposit' | 'insurance' | 'others';
type TransactionStatus = 'completed' | 'pending' | 'failed' | 'cancelled';

interface Transaction {
  id: number;
  clientId: number;
  transactionDate: string;
  settlementDate?: string;
  transactionType: TransactionType;
  productType: ProductType;
  productName: string;
  productCategory?: string;
  quantity?: number;
  price?: number;
  amount: number;
  fees?: number;
  taxes?: number;
  totalAmount: number;
  currencyCode: string;
  status: TransactionStatus;
  reference?: string;
  description?: string;
  portfolioImpact?: number;
  createdAt: string;
}

interface Client {
  id: number;
  fullName: string;
  tier: string;
  aum: string;
  aumValue: number;
  // ... other client fields
}

interface DateRange {
  from?: Date;
  to?: Date;
}

// Sample data for development
const mockTransactions: Transaction[] = [
  {
    id: 1,
    clientId: 10,
    transactionDate: '2025-05-20T10:30:00Z',
    settlementDate: '2025-05-22T10:30:00Z',
    transactionType: 'buy',
    productType: 'equity',
    productName: 'HDFC Bank Ltd.',
    productCategory: 'large_cap',
    quantity: 10,
    price: 1650.50,
    amount: 16505.00,
    fees: 165.05,
    taxes: 82.52,
    totalAmount: 16752.57,
    currencyCode: 'INR',
    status: 'completed',
    reference: 'TXN-HDFC-001',
    description: 'Purchase of HDFC Bank shares',
    portfolioImpact: 0.8,
    createdAt: '2025-05-20T10:30:00Z'
  },
  {
    id: 2,
    clientId: 10,
    transactionDate: '2025-05-18T11:45:00Z',
    settlementDate: '2025-05-20T11:45:00Z',
    transactionType: 'sell',
    productType: 'equity',
    productName: 'Reliance Industries Ltd.',
    productCategory: 'large_cap',
    quantity: 5,
    price: 2400.75,
    amount: 12003.75,
    fees: 120.04,
    taxes: 60.02,
    totalAmount: 11823.69,
    currencyCode: 'INR',
    status: 'completed',
    reference: 'TXN-RIL-001',
    description: 'Sale of Reliance shares',
    portfolioImpact: -0.5,
    createdAt: '2025-05-18T11:45:00Z'
  },
  {
    id: 3,
    clientId: 10,
    transactionDate: '2025-05-15T09:15:00Z',
    settlementDate: '2025-05-15T09:15:00Z',
    transactionType: 'dividend',
    productType: 'equity',
    productName: 'Infosys Ltd.',
    productCategory: 'large_cap',
    amount: 1250.00,
    taxes: 125.00,
    totalAmount: 1125.00,
    currencyCode: 'INR',
    status: 'completed',
    reference: 'DIV-INFY-001',
    description: 'Dividend payout from Infosys',
    portfolioImpact: 0.1,
    createdAt: '2025-05-15T09:15:00Z'
  },
  {
    id: 4,
    clientId: 10,
    transactionDate: '2025-05-10T14:30:00Z',
    settlementDate: '2025-05-10T14:30:00Z',
    transactionType: 'deposit',
    productType: 'others',
    productName: 'Cash Deposit',
    amount: 100000.00,
    totalAmount: 100000.00,
    currencyCode: 'INR',
    status: 'completed',
    reference: 'DEP-001',
    description: 'Cash deposit to investment account',
    portfolioImpact: 5.0,
    createdAt: '2025-05-10T14:30:00Z'
  },
  {
    id: 5,
    clientId: 10,
    transactionDate: '2025-05-05T16:00:00Z',
    settlementDate: '2025-05-07T16:00:00Z',
    transactionType: 'buy',
    productType: 'mutual_fund',
    productName: 'Nippon India Growth Fund',
    productCategory: 'equity_diversified',
    quantity: 500,
    price: 50.50,
    amount: 25250.00,
    fees: 252.50,
    totalAmount: 25502.50,
    currencyCode: 'INR',
    status: 'completed',
    reference: 'MF-NIP-001',
    description: 'Purchase of Nippon India Growth Fund units',
    portfolioImpact: 1.2,
    createdAt: '2025-05-05T16:00:00Z'
  },
  {
    id: 6,
    clientId: 10,
    transactionDate: '2025-05-01T11:00:00Z',
    settlementDate: '2025-05-01T11:00:00Z',
    transactionType: 'interest',
    productType: 'fixed_deposit',
    productName: 'HDFC Bank FD',
    amount: 3750.00,
    taxes: 375.00,
    totalAmount: 3375.00,
    currencyCode: 'INR',
    status: 'completed',
    reference: 'INT-HDFC-001',
    description: 'Interest payment from FD',
    portfolioImpact: 0.2,
    createdAt: '2025-05-01T11:00:00Z'
  },
  {
    id: 7,
    clientId: 10,
    transactionDate: '2025-04-28T13:15:00Z',
    settlementDate: '2025-04-30T13:15:00Z',
    transactionType: 'buy',
    productType: 'bond',
    productName: 'NHAI Tax-Free Bonds',
    productCategory: 'government',
    quantity: 10,
    price: 1100.00,
    amount: 11000.00,
    fees: 110.00,
    totalAmount: 11110.00,
    currencyCode: 'INR',
    status: 'completed',
    reference: 'BND-NHAI-001',
    description: 'Purchase of NHAI bonds',
    portfolioImpact: 0.6,
    createdAt: '2025-04-28T13:15:00Z'
  },
  {
    id: 8,
    clientId: 10,
    transactionDate: '2025-04-25T10:00:00Z',
    settlementDate: '2025-04-25T10:00:00Z',
    transactionType: 'fee',
    productType: 'others',
    productName: 'Advisory Fee',
    amount: 5000.00,
    totalAmount: 5000.00,
    currencyCode: 'INR',
    status: 'completed',
    reference: 'FEE-001',
    description: 'Quarterly advisory fee',
    portfolioImpact: -0.25,
    createdAt: '2025-04-25T10:00:00Z'
  },
  {
    id: 9,
    clientId: 10,
    transactionDate: '2025-04-20T15:30:00Z',
    settlementDate: '2025-04-22T15:30:00Z',
    transactionType: 'sell',
    productType: 'mutual_fund',
    productName: 'SBI Blue Chip Fund',
    productCategory: 'equity_large_cap',
    quantity: 1000,
    price: 45.75,
    amount: 45750.00,
    fees: 457.50,
    taxes: 228.75,
    totalAmount: 45063.75,
    currencyCode: 'INR',
    status: 'completed',
    reference: 'MF-SBI-001',
    description: 'Redemption of SBI Blue Chip Fund units',
    portfolioImpact: -2.0,
    createdAt: '2025-04-20T15:30:00Z'
  },
  {
    id: 10,
    clientId: 10,
    transactionDate: '2025-04-15T11:45:00Z',
    settlementDate: '2025-04-15T11:45:00Z',
    transactionType: 'withdrawal',
    productType: 'others',
    productName: 'Cash Withdrawal',
    amount: 25000.00,
    totalAmount: 25000.00,
    currencyCode: 'INR',
    status: 'completed',
    reference: 'WDR-001',
    description: 'Cash withdrawal from investment account',
    portfolioImpact: -1.25,
    createdAt: '2025-04-15T11:45:00Z'
  }
];

// Mock transaction summary data
const mockTransactionSummary = [
  { month: 'Jan 2025', buys: 120000, sells: 80000, net: 40000 },
  { month: 'Feb 2025', buys: 150000, sells: 70000, net: 80000 },
  { month: 'Mar 2025', buys: 110000, sells: 90000, net: 20000 },
  { month: 'Apr 2025', buys: 180000, sells: 100000, net: 80000 },
  { month: 'May 2025', buys: 130000, sells: 60000, net: 70000 },
];

// Format currency values
const formatCurrency = (value: number, currency: string = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0
  }).format(value);
};

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return format(date, 'dd MMM yyyy');
};

// Get transaction type badge color
const getTransactionTypeColor = (type: TransactionType) => {
  switch (type) {
    case 'buy':
      return 'bg-green-100 text-green-800 hover:bg-green-100';
    case 'sell':
      return 'bg-red-100 text-red-800 hover:bg-red-100';
    case 'dividend':
    case 'interest':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-100';
    case 'fee':
      return 'bg-orange-100 text-orange-800 hover:bg-orange-100';
    case 'deposit':
      return 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100';
    case 'withdrawal':
      return 'bg-amber-100 text-amber-800 hover:bg-amber-100';
    default:
      return 'bg-slate-100 text-slate-800 hover:bg-slate-100';
  }
};

// Get status badge color
const getStatusColor = (status: TransactionStatus) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 hover:bg-green-100';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
    case 'failed':
      return 'bg-red-100 text-red-800 hover:bg-red-100';
    case 'cancelled':
      return 'bg-slate-100 text-slate-800 hover:bg-slate-100';
    default:
      return 'bg-slate-100 text-slate-800 hover:bg-slate-100';
  }
};

// Main component
const ClientTransactions = () => {
  const { toast } = useToast();
  const [clientId, setClientId] = useState<number | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [transactionSummary, setTransactionSummary] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedProductType, setSelectedProductType] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({});
  
  // Parse client ID from URL
  useEffect(() => {
    const hash = window.location.hash;
    const match = hash.match(/\/clients\/(\d+)\/transactions/);
    if (match && match[1]) {
      setClientId(parseInt(match[1], 10));
    }
  }, []);
  
  // Fetch client data
  const { data: clientData, isLoading: clientLoading } = useQuery({
    queryKey: [`/api/clients/${clientId}`],
    enabled: !!clientId,
  });
  
  // Fetch transactions
  const { data: transactionData, isLoading: transactionsLoading } = useQuery({
    queryKey: [`/api/transactions`, { clientId }],
    enabled: !!clientId,
  });
  
  // Set client and transaction data when fetched
  useEffect(() => {
    if (clientData) {
      setClient(clientData);
    }
    
    // For now, use mock data - replace with actual API data when available
    if (clientId) {
      setTransactions(mockTransactions);
      setFilteredTransactions(mockTransactions);
      setTransactionSummary(mockTransactionSummary);
    }
  }, [clientData, transactionData, clientId]);
  
  // Apply filters when filter values change
  useEffect(() => {
    if (!transactions.length) return;
    
    let filtered = [...transactions];
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(tx => 
        tx.productName.toLowerCase().includes(term) || 
        tx.reference?.toLowerCase().includes(term) || 
        tx.description?.toLowerCase().includes(term)
      );
    }
    
    // Apply transaction type filter
    if (selectedType) {
      filtered = filtered.filter(tx => tx.transactionType === selectedType);
    }
    
    // Apply product type filter
    if (selectedProductType) {
      filtered = filtered.filter(tx => tx.productType === selectedProductType);
    }
    
    // Apply status filter
    if (selectedStatus) {
      filtered = filtered.filter(tx => tx.status === selectedStatus);
    }
    
    // Apply date range filter
    if (dateRange.from) {
      filtered = filtered.filter(tx => new Date(tx.transactionDate) >= dateRange.from!);
    }
    
    if (dateRange.to) {
      filtered = filtered.filter(tx => new Date(tx.transactionDate) <= dateRange.to!);
    }
    
    setFilteredTransactions(filtered);
  }, [searchTerm, selectedType, selectedProductType, selectedStatus, dateRange, transactions]);
  
  // Calculate statistics
  const txStats = React.useMemo(() => {
    if (!filteredTransactions.length) return { count: 0, totalAmount: 0, totalBuys: 0, totalSells: 0 };
    
    const count = filteredTransactions.length;
    const totalAmount = filteredTransactions.reduce((sum, tx) => sum + tx.totalAmount, 0);
    const buys = filteredTransactions.filter(tx => tx.transactionType === 'buy');
    const sells = filteredTransactions.filter(tx => tx.transactionType === 'sell');
    const totalBuys = buys.reduce((sum, tx) => sum + tx.totalAmount, 0);
    const totalSells = sells.reduce((sum, tx) => sum + tx.totalAmount, 0);
    
    return { count, totalAmount, totalBuys, totalSells };
  }, [filteredTransactions]);
  
  // Export to CSV
  const exportToCSV = () => {
    if (!filteredTransactions.length) {
      toast({
        title: "No data to export",
        description: "Apply different filters or make sure you have transactions data.",
        variant: "destructive"
      });
      return;
    }
    
    // Create CSV headers
    const headers = [
      'Transaction Date',
      'Settlement Date',
      'Type',
      'Product',
      'Name',
      'Category',
      'Quantity',
      'Price',
      'Amount',
      'Fees',
      'Taxes',
      'Total Amount',
      'Currency',
      'Status',
      'Reference',
      'Description'
    ].join(',');
    
    // Create CSV rows
    const rows = filteredTransactions.map(tx => [
      formatDate(tx.transactionDate),
      tx.settlementDate ? formatDate(tx.settlementDate) : '',
      tx.transactionType,
      tx.productType,
      `"${tx.productName}"`, // Quote string to handle commas
      tx.productCategory || '',
      tx.quantity || '',
      tx.price || '',
      tx.amount,
      tx.fees || '',
      tx.taxes || '',
      tx.totalAmount,
      tx.currencyCode,
      tx.status,
      tx.reference || '',
      `"${tx.description || ''}"` // Quote string to handle commas
    ].join(','));
    
    // Combine headers and rows
    const csv = [headers, ...rows].join('\n');
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions_${clientId}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export successful",
      description: "The transaction data has been exported to CSV.",
    });
  };
  
  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType(null);
    setSelectedProductType(null);
    setSelectedStatus(null);
    setDateRange({});
    setFilteredTransactions(transactions);
  };
  
  // Return to client details
  const handleBackClick = () => {
    if (clientId) {
      window.location.hash = `/clients/${clientId}`;
    } else {
      window.location.hash = '/clients';
    }
  };
  
  // Render loading state
  if (clientLoading || !client) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleBackClick}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-xl font-bold">Transactions</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading client data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleBackClick}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div>
            <h1 className="text-xl font-bold">{client.fullName} - Transactions</h1>
            <p className="text-sm text-muted-foreground">
              View and analyze all transactions for this client
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={exportToCSV}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Transactions</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        {/* All Transactions Tab */}
        <TabsContent value="all" className="space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex flex-col">
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <h3 className="text-2xl font-bold">{txStats.count}</h3>
                <p className="text-xs text-muted-foreground mt-1">In selected period</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex flex-col">
                <p className="text-sm text-muted-foreground">Total Transaction Value</p>
                <h3 className="text-2xl font-bold">{formatCurrency(txStats.totalAmount)}</h3>
                <p className="text-xs text-muted-foreground mt-1">Gross amount of all transactions</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex flex-col">
                <p className="text-sm text-muted-foreground">Total Buy Transactions</p>
                <h3 className="text-2xl font-bold">{formatCurrency(txStats.totalBuys)}</h3>
                <p className="text-xs text-muted-foreground mt-1">Inflow transactions</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex flex-col">
                <p className="text-sm text-muted-foreground">Total Sell Transactions</p>
                <h3 className="text-2xl font-bold">{formatCurrency(txStats.totalSells)}</h3>
                <p className="text-xs text-muted-foreground mt-1">Outflow transactions</p>
              </CardContent>
            </Card>
          </div>
          
          {/* Filters */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </CardTitle>
              <CardDescription>
                Filter transactions by various criteria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-1">
                  <label htmlFor="search" className="text-xs font-medium">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search transactions..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label htmlFor="transaction-type" className="text-xs font-medium">
                    Transaction Type
                  </label>
                  <Select
                    value={selectedType || ''}
                    onValueChange={(value) => setSelectedType(value || null)}
                  >
                    <SelectTrigger id="transaction-type">
                      <SelectValue placeholder="All types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All types</SelectItem>
                      <SelectItem value="buy">Buy</SelectItem>
                      <SelectItem value="sell">Sell</SelectItem>
                      <SelectItem value="dividend">Dividend</SelectItem>
                      <SelectItem value="interest">Interest</SelectItem>
                      <SelectItem value="fee">Fee</SelectItem>
                      <SelectItem value="deposit">Deposit</SelectItem>
                      <SelectItem value="withdrawal">Withdrawal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1">
                  <label htmlFor="product-type" className="text-xs font-medium">
                    Product Type
                  </label>
                  <Select
                    value={selectedProductType || ''}
                    onValueChange={(value) => setSelectedProductType(value || null)}
                  >
                    <SelectTrigger id="product-type">
                      <SelectValue placeholder="All products" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All products</SelectItem>
                      <SelectItem value="equity">Equity</SelectItem>
                      <SelectItem value="mutual_fund">Mutual Fund</SelectItem>
                      <SelectItem value="bond">Bond</SelectItem>
                      <SelectItem value="fixed_deposit">Fixed Deposit</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1">
                  <label htmlFor="status" className="text-xs font-medium">
                    Status
                  </label>
                  <Select
                    value={selectedStatus || ''}
                    onValueChange={(value) => setSelectedStatus(value || null)}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All statuses</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-medium">
                    Date Range
                  </label>
                  <DatePickerWithRange
                    date={dateRange}
                    setDate={setDateRange}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            </CardFooter>
          </Card>
          
          {/* Transactions Table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Transaction List</CardTitle>
              <CardDescription>
                {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
                {searchTerm || selectedType || selectedProductType || selectedStatus || dateRange.from || dateRange.to
                  ? ' (filtered)'
                  : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                          No transactions found. Try adjusting your filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTransactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell className="font-medium">
                            {formatDate(tx.transactionDate)}
                          </TableCell>
                          <TableCell>
                            <Badge className={getTransactionTypeColor(tx.transactionType)}>
                              {tx.transactionType.charAt(0).toUpperCase() + tx.transactionType.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{tx.productName}</span>
                              <span className="text-xs text-muted-foreground">
                                {tx.productType.replace('_', ' ')}
                                {tx.productCategory ? ` • ${tx.productCategory.replace('_', ' ')}` : ''}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm truncate block max-w-[200px]">
                              {tx.description || '-'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            {tx.quantity ? `${tx.quantity} × ${tx.price ? formatCurrency(tx.price) : '-'}` : formatCurrency(tx.amount)}
                          </TableCell>
                          <TableCell className={`text-right font-medium ${tx.transactionType === 'buy' || tx.transactionType === 'fee' || tx.transactionType === 'withdrawal' ? 'text-red-600' : 'text-green-600'}`}>
                            {(tx.transactionType === 'buy' || tx.transactionType === 'fee' || tx.transactionType === 'withdrawal') 
                              ? `- ${formatCurrency(tx.totalAmount)}`
                              : `+ ${formatCurrency(tx.totalAmount)}`}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(tx.status)}>
                              {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            {tx.reference || '-'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <PieChart className="h-4 w-4 mr-2" />
                  Transaction Distribution
                </CardTitle>
                <CardDescription>
                  By transaction type
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={[
                        { type: 'Buy', count: filteredTransactions.filter(tx => tx.transactionType === 'buy').length },
                        { type: 'Sell', count: filteredTransactions.filter(tx => tx.transactionType === 'sell').length },
                        { type: 'Dividend', count: filteredTransactions.filter(tx => tx.transactionType === 'dividend').length },
                        { type: 'Interest', count: filteredTransactions.filter(tx => tx.transactionType === 'interest').length },
                        { type: 'Fee', count: filteredTransactions.filter(tx => tx.transactionType === 'fee').length },
                        { type: 'Deposit', count: filteredTransactions.filter(tx => tx.transactionType === 'deposit').length },
                        { type: 'Withdrawal', count: filteredTransactions.filter(tx => tx.transactionType === 'withdrawal').length },
                      ]}
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="type" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value} transactions`, 'Count']} />
                      <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <BarChart className="h-4 w-4 mr-2" />
                  Value Distribution
                </CardTitle>
                <CardDescription>
                  By product type
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={[
                        { type: 'Equity', value: filteredTransactions.filter(tx => tx.productType === 'equity').reduce((sum, tx) => sum + tx.amount, 0) },
                        { type: 'Mutual Fund', value: filteredTransactions.filter(tx => tx.productType === 'mutual_fund').reduce((sum, tx) => sum + tx.amount, 0) },
                        { type: 'Bond', value: filteredTransactions.filter(tx => tx.productType === 'bond').reduce((sum, tx) => sum + tx.amount, 0) },
                        { type: 'Fixed Deposit', value: filteredTransactions.filter(tx => tx.productType === 'fixed_deposit').reduce((sum, tx) => sum + tx.amount, 0) },
                        { type: 'Insurance', value: filteredTransactions.filter(tx => tx.productType === 'insurance').reduce((sum, tx) => sum + tx.amount, 0) },
                        { type: 'Others', value: filteredTransactions.filter(tx => tx.productType === 'others').reduce((sum, tx) => sum + tx.amount, 0) },
                      ]}
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="type" />
                      <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                      <Tooltip formatter={(value) => [formatCurrency(value as number), 'Value']} />
                      <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Activity className="h-4 w-4 mr-2" />
                  Monthly Transaction Activity
                </CardTitle>
                <CardDescription>
                  Last 5 months
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={mockTransactionSummary}
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                      <Tooltip formatter={(value) => [formatCurrency(value as number), '']} />
                      <Legend />
                      <Line type="monotone" dataKey="buys" stroke="#10b981" activeDot={{ r: 8 }} name="Buys" />
                      <Line type="monotone" dataKey="sells" stroke="#ef4444" name="Sells" />
                      <Line type="monotone" dataKey="net" stroke="#3b82f6" strokeDasharray="5 5" name="Net" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Transaction Summary Table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                Transaction Summary
              </CardTitle>
              <CardDescription>
                Monthly summary of transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead className="text-right">Total Transactions</TableHead>
                      <TableHead className="text-right">Buy Volume</TableHead>
                      <TableHead className="text-right">Sell Volume</TableHead>
                      <TableHead className="text-right">Net Flow</TableHead>
                      <TableHead className="text-right">Fees Paid</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockTransactionSummary.map((month) => (
                      <TableRow key={month.month}>
                        <TableCell className="font-medium">{month.month}</TableCell>
                        <TableCell className="text-right">
                          {Math.floor(month.buys / 10000) + Math.floor(month.sells / 15000)}
                        </TableCell>
                        <TableCell className="text-right text-green-600 font-medium">
                          {formatCurrency(month.buys)}
                        </TableCell>
                        <TableCell className="text-right text-red-600 font-medium">
                          {formatCurrency(month.sells)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(month.net)}
                        </TableCell>
                        <TableCell className="text-right text-slate-600">
                          {formatCurrency(month.buys * 0.01 + month.sells * 0.01)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Transaction Trends */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Transaction Trends
                </CardTitle>
                <CardDescription>
                  Analysis of transaction patterns over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Transaction Volume Trend</h3>
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={[
                            { month: 'Jan', volume: 12 },
                            { month: 'Feb', volume: 19 },
                            { month: 'Mar', volume: 15 },
                            { month: 'Apr', volume: 22 },
                            { month: 'May', volume: 18 },
                          ]}
                          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="volume" stroke="#3b82f6" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="pt-2">
                    <h3 className="text-sm font-medium mb-2">Key Observations</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <TrendingUp className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                        <span>Transaction frequency has increased by 25% in the last 3 months</span>
                      </li>
                      <li className="flex items-start">
                        <TrendingDown className="h-4 w-4 mr-2 mt-0.5 text-red-500" />
                        <span>Average transaction size decreased from ₹15,000 to ₹12,500</span>
                      </li>
                      <li className="flex items-start">
                        <CreditCard className="h-4 w-4 mr-2 mt-0.5 text-blue-500" />
                        <span>Client typically transacts more at the beginning of each month</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Portfolio Impact */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <BarChart className="h-4 w-4 mr-2" />
                  Portfolio Impact
                </CardTitle>
                <CardDescription>
                  How transactions have affected the portfolio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Cumulative Portfolio Impact</h3>
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={[
                            { month: 'Jan', impact: 3.2 },
                            { month: 'Feb', impact: 5.1 },
                            { month: 'Mar', impact: 4.3 },
                            { month: 'Apr', impact: 7.5 },
                            { month: 'May', impact: 9.2 },
                          ]}
                          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis unit="%" />
                          <Tooltip formatter={(value) => [`${value}%`, 'Impact']} />
                          <Line type="monotone" dataKey="impact" stroke="#10b981" />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="pt-2">
                    <h3 className="text-sm font-medium mb-2">Notable Transactions</h3>
                    <div className="space-y-2">
                      {filteredTransactions
                        .filter(tx => tx.portfolioImpact && Math.abs(tx.portfolioImpact) >= 0.5)
                        .sort((a, b) => (b.portfolioImpact || 0) - (a.portfolioImpact || 0))
                        .slice(0, 3)
                        .map(tx => (
                          <div key={tx.id} className="flex items-start space-x-2 p-2 bg-slate-50 rounded-md">
                            {tx.portfolioImpact && tx.portfolioImpact > 0 ? (
                              <TrendingUp className="h-4 w-4 text-green-500 mt-0.5" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-500 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <p className="text-sm font-medium">{tx.productName}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(tx.transactionDate)} • {tx.transactionType}</p>
                            </div>
                            <div className="text-right">
                              <p className={`text-sm font-medium ${tx.portfolioImpact && tx.portfolioImpact > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {tx.portfolioImpact ? `${tx.portfolioImpact > 0 ? '+' : ''}${tx.portfolioImpact.toFixed(1)}%` : ''}
                              </p>
                              <p className="text-xs text-muted-foreground">{formatCurrency(tx.totalAmount)}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Churn Analysis */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Activity className="h-4 w-4 mr-2" />
                  Churn Analysis
                </CardTitle>
                <CardDescription>
                  Asset inflow and outflow analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Net Asset Flow (Last 6 Months)</h3>
                    <div className="h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart
                          data={[
                            { month: 'Dec', inflow: 150000, outflow: 80000 },
                            { month: 'Jan', inflow: 180000, outflow: 90000 },
                            { month: 'Feb', inflow: 200000, outflow: 120000 },
                            { month: 'Mar', inflow: 160000, outflow: 150000 },
                            { month: 'Apr', inflow: 220000, outflow: 100000 },
                            { month: 'May', inflow: 250000, outflow: 120000 },
                          ]}
                          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="month" />
                          <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                          <Tooltip formatter={(value) => [formatCurrency(value as number), '']} />
                          <Legend />
                          <Bar dataKey="inflow" name="Inflow" fill="#10b981" stackId="a" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="outflow" name="Outflow" fill="#ef4444" stackId="a" radius={[4, 4, 0, 0]} />
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Churn Rate (6m)</p>
                      <div className="flex items-baseline space-x-2">
                        <p className="text-xl font-bold">12.5%</p>
                        <p className="text-xs text-green-600">↓ 2.3%</p>
                      </div>
                      <p className="text-xs text-muted-foreground">Lower than client average</p>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Net Flow Ratio</p>
                      <div className="flex items-baseline space-x-2">
                        <p className="text-xl font-bold">1.85</p>
                        <p className="text-xs text-green-600">↑ 0.3</p>
                      </div>
                      <p className="text-xs text-muted-foreground">Inflow to outflow ratio</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Recommendations */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Recommendations
                </CardTitle>
                <CardDescription>
                  Insights based on transaction patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <h3 className="text-sm font-medium text-blue-800 mb-1">Investment Pattern</h3>
                    <p className="text-xs text-blue-700">
                      Client demonstrates a disciplined monthly investment approach. Consider suggesting a Systematic Investment Plan (SIP) for greater consistency and automation.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <h3 className="text-sm font-medium text-green-800 mb-1">Diversification Opportunity</h3>
                    <p className="text-xs text-green-700">
                      Transaction data shows 72% concentration in equity investments. Recommend diversifying into bonds and fixed income products to balance portfolio risk.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                    <h3 className="text-sm font-medium text-amber-800 mb-1">Fee Optimization</h3>
                    <p className="text-xs text-amber-700">
                      Client paid ₹12,500 in transaction fees over the last 6 months. Consider discussing fee-optimized investment strategies or premium service tier benefits.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-md">
                    <h3 className="text-sm font-medium text-purple-800 mb-1">Tax Planning</h3>
                    <p className="text-xs text-purple-700">
                      Recent selling pattern may have tax implications. Schedule a tax planning discussion before the end of the financial year.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClientTransactions;