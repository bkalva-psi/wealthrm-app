import React, { useState, useEffect } from 'react';
import { useApiQuery } from '@/lib/queryClient';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { format, isValid, parseISO, subMonths } from 'date-fns';
import { 
  ArrowLeft, 
  Download, 
  Calendar as CalendarIcon, 
  Filter, 
  Search, 
  ArrowUpDown, 
  ArrowDown,
  ArrowUp,
  X,
  Plus
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';

// Transaction type definition
interface Transaction {
  id: number;
  clientId: number;
  transactionDate: string;
  settlementDate?: string;
  transactionType: string;
  productType: string;
  productName: string;
  productCategory?: string;
  quantity?: number;
  price?: number;
  amount: number;
  fees?: number;
  taxes?: number;
  totalAmount: number;
  currencyCode?: string;
  status: string;
  reference?: string;
  description?: string;
  portfolioImpact?: number;
  createdAt: string;
}

// Transaction Summary type definition
interface TransactionSummary {
  period: string;
  transactionCount: number;
  totalAmount: number;
  totalFees: number;
  totalTaxes: number;
  netAmount: number;
  buyCount: number;
  sellCount: number;
  otherCount: number;
  transactions: Transaction[];
}

// Client type definition
interface Client {
  id: number;
  fullName: string;
  initials?: string;
  email?: string;
  phone?: string;
  tier: string;
  aum: string;
  aumValue: number;
  riskProfile?: string;
  lastContactDate?: string;
  lastTransactionDate?: string;
  totalTransactionCount?: number;
  averageTransactionValue?: number;
}

export default function ClientTransactions() {
  // Get client ID from URL
  const clientId = parseInt(window.location.hash.split('/')[2] || '0');
  
  // Date filter state
  const [startDate, setStartDate] = useState<Date>(subMonths(new Date(), 3));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [groupBy, setGroupBy] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>('month');
  const [transactionType, setTransactionType] = useState<string>('all');
  const [productType, setProductType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Get client data
  const { data: client, isLoading: isClientLoading } = useApiQuery<Client>({
    queryKey: [`/api/clients/${clientId}`],
    enabled: !!clientId
  });
  
  // Get transaction data
  const { data: transactions, isLoading: isTransactionsLoading } = useApiQuery<Transaction[]>({
    queryKey: [
      `/api/clients/${clientId}/transactions`, 
      { startDate: startDate.toISOString(), endDate: endDate.toISOString() }
    ],
    enabled: !!clientId
  });
  
  // Get transaction summary data
  const { data: transactionSummary, isLoading: isSummaryLoading } = useApiQuery<TransactionSummary[]>({
    queryKey: [
      `/api/clients/${clientId}/transactions/summary`, 
      { 
        startDate: startDate.toISOString(), 
        endDate: endDate.toISOString(),
        groupBy
      }
    ],
    enabled: !!clientId
  });

  // Filter transactions based on search query and other filters
  const filteredTransactions = React.useMemo(() => {
    if (!transactions) return [];
    
    return transactions.filter(transaction => {
      // Apply transaction type filter
      if (transactionType !== 'all' && transaction.transactionType !== transactionType) {
        return false;
      }
      
      // Apply product type filter
      if (productType !== 'all' && transaction.productType !== productType) {
        return false;
      }
      
      // Apply search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          transaction.productName.toLowerCase().includes(query) ||
          transaction.description?.toLowerCase().includes(query) ||
          transaction.reference?.toLowerCase().includes(query) ||
          transaction.transactionType.toLowerCase().includes(query) ||
          transaction.productType.toLowerCase().includes(query) ||
          transaction.productCategory?.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  }, [transactions, transactionType, productType, searchQuery]);
  
  // Sort transactions
  const sortedTransactions = React.useMemo(() => {
    if (!filteredTransactions) return [];
    
    return [...filteredTransactions].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime();
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'productName':
          comparison = a.productName.localeCompare(b.productName);
          break;
        case 'transactionType':
          comparison = a.transactionType.localeCompare(b.transactionType);
          break;
        case 'productType':
          comparison = a.productType.localeCompare(b.productType);
          break;
        default:
          comparison = new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime();
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredTransactions, sortBy, sortDirection]);
  
  // Helper function for formatting currency
  const formatCurrency = (amount: number, currencyCode: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currencyCode
    }).format(amount);
  };
  
  // Calculate metrics for dashboard
  const metrics = React.useMemo(() => {
    if (!transactions) return {
      totalTransactions: 0,
      totalValue: 0,
      buyCount: 0,
      sellCount: 0,
      averageTransactionValue: 0,
      totalFees: 0,
      largestTransaction: 0
    };
    
    const totalTransactions = transactions.length;
    const totalValue = transactions.reduce((sum, t) => sum + t.amount, 0);
    const buyCount = transactions.filter(t => t.transactionType === 'buy').length;
    const sellCount = transactions.filter(t => t.transactionType === 'sell').length;
    const averageTransactionValue = totalTransactions > 0 ? totalValue / totalTransactions : 0;
    const totalFees = transactions.reduce((sum, t) => sum + (t.fees || 0) + (t.taxes || 0), 0);
    const largestTransaction = Math.max(...transactions.map(t => t.amount));
    
    return {
      totalTransactions,
      totalValue,
      buyCount,
      sellCount,
      averageTransactionValue,
      totalFees,
      largestTransaction
    };
  }, [transactions]);
  
  // Transaction type distribution for chart
  const transactionTypeData = React.useMemo(() => {
    if (!transactions) return [];
    
    const typeCounts: Record<string, number> = {};
    
    transactions.forEach(transaction => {
      const type = transaction.transactionType;
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    
    return Object.entries(typeCounts).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count
    }));
  }, [transactions]);
  
  // Product type distribution for chart
  const productTypeData = React.useMemo(() => {
    if (!transactions) return [];
    
    const typeCounts: Record<string, number> = {};
    
    transactions.forEach(transaction => {
      const type = transaction.productType;
      typeCounts[type] = (typeCounts[type] || 0) + 1;
    });
    
    return Object.entries(typeCounts).map(([type, count]) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count
    }));
  }, [transactions]);
  
  // Transaction volume over time for chart
  const volumeOverTimeData = React.useMemo(() => {
    if (!transactionSummary) return [];
    
    return transactionSummary.map(summary => ({
      period: summary.period,
      Buys: summary.buyCount,
      Sells: summary.sellCount,
      Other: summary.otherCount,
      totalAmount: summary.totalAmount
    })).reverse(); // Reverse to show oldest to newest
  }, [transactionSummary]);
  
  // Calculate churn ratio (sell/buy ratio)
  const churnRatio = React.useMemo(() => {
    if (!metrics.buyCount) return 0;
    return metrics.sellCount / metrics.buyCount;
  }, [metrics]);
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#EC7063'];
  
  // Unique transaction types, product types, and product categories for filters
  const uniqueTransactionTypes = React.useMemo(() => {
    if (!transactions) return [];
    
    const types = new Set<string>();
    transactions.forEach(transaction => {
      types.add(transaction.transactionType);
    });
    
    return Array.from(types).sort();
  }, [transactions]);
  
  const uniqueProductTypes = React.useMemo(() => {
    if (!transactions) return [];
    
    const types = new Set<string>();
    transactions.forEach(transaction => {
      types.add(transaction.productType);
    });
    
    return Array.from(types).sort();
  }, [transactions]);
  
  // Handle sorting change
  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  // Export transactions to CSV
  const exportToCSV = () => {
    if (!transactions || transactions.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no transactions available to export.",
        variant: "destructive"
      });
      return;
    }
    
    // Create CSV header
    const headers = [
      'Transaction Date',
      'Settlement Date',
      'Type',
      'Product Type',
      'Product Name',
      'Product Category',
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
    ];
    
    // Create CSV rows
    const rows = transactions.map(transaction => [
      transaction.transactionDate ? format(new Date(transaction.transactionDate), 'yyyy-MM-dd') : '',
      transaction.settlementDate ? format(new Date(transaction.settlementDate), 'yyyy-MM-dd') : '',
      transaction.transactionType,
      transaction.productType,
      transaction.productName,
      transaction.productCategory || '',
      transaction.quantity || '',
      transaction.price || '',
      transaction.amount,
      transaction.fees || '',
      transaction.taxes || '',
      transaction.totalAmount,
      transaction.currencyCode || 'INR',
      transaction.status,
      transaction.reference || '',
      transaction.description || ''
    ]);
    
    // Combine header and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create a Blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `client_${clientId}_transactions.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export successful",
      description: "Transaction data has been exported to CSV."
    });
  };
  
  // If client not found
  if (clientId === 0) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Client Not Found</CardTitle>
            <CardDescription>Please select a client to view their transactions</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" onClick={() => window.location.hash = '/clients'}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Clients
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header with navigation back to client */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Button variant="ghost" onClick={() => window.location.hash = `/clients/${clientId}`} className="pl-0 mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Client
          </Button>
          <h1 className="text-2xl font-bold">{isClientLoading ? 'Loading...' : `${client?.fullName}'s Transactions`}</h1>
          <p className="text-muted-foreground">
            {isClientLoading ? '' : `AUM: ${client?.aum} • Total Transactions: ${client?.totalTransactionCount || 0}`}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={exportToCSV} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add New Transaction</DialogTitle>
                <DialogDescription>
                  Record a new transaction for this client. Fill in the required details below.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="transactionDate" className="text-right">
                    Date
                  </Label>
                  <Input
                    id="transactionDate"
                    type="date"
                    className="col-span-3"
                    defaultValue={format(new Date(), 'yyyy-MM-dd')}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="transactionType" className="text-right">
                    Type
                  </Label>
                  <Select defaultValue="buy">
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
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
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="productType" className="text-right">
                    Product Type
                  </Label>
                  <Select defaultValue="equity">
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select product type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equity">Equity</SelectItem>
                      <SelectItem value="mutual_fund">Mutual Fund</SelectItem>
                      <SelectItem value="bond">Bond</SelectItem>
                      <SelectItem value="fixed_deposit">Fixed Deposit</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                      <SelectItem value="commodity">Commodity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="productName" className="text-right">
                    Product Name
                  </Label>
                  <Input id="productName" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">
                    Amount
                  </Label>
                  <Input id="amount" type="number" className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Record Transaction</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Date range filter */}
      <Card className="bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Transaction Period</CardTitle>
          <CardDescription>Select the date range to analyze transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="space-y-2 flex-1">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2 flex-1">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>Group By</Label>
              <Select value={groupBy} onValueChange={(value) => setGroupBy(value as any)}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Select grouping" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="quarter">Quarter</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button className="md:mb-0">Apply Filters</Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Dashboard Summary */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full sm:w-auto mb-4">
          <TabsTrigger value="overview" className="flex-1 sm:flex-none">Overview</TabsTrigger>
          <TabsTrigger value="details" className="flex-1 sm:flex-none">Transaction Details</TabsTrigger>
          <TabsTrigger value="analytics" className="flex-1 sm:flex-none">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Key Metrics */}
            <Card className="bg-white md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Transaction Summary</CardTitle>
                <CardDescription>Key metrics for the selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Transactions</p>
                    <p className="text-2xl font-bold">{metrics.totalTransactions}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Value</p>
                    <p className="text-2xl font-bold">{formatCurrency(metrics.totalValue)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Avg. Transaction</p>
                    <p className="text-2xl font-bold">{formatCurrency(metrics.averageTransactionValue)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Buy Transactions</p>
                    <p className="text-2xl font-bold">{metrics.buyCount}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Sell Transactions</p>
                    <p className="text-2xl font-bold">{metrics.sellCount}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Churn Ratio</p>
                    <p className="text-2xl font-bold">{churnRatio.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">(Sell/Buy Ratio)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Transaction Type Distribution */}
            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Transaction Types</CardTitle>
                <CardDescription>Distribution by transaction type</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center items-center h-48">
                {isTransactionsLoading ? (
                  <Skeleton className="h-48 w-full" />
                ) : transactionTypeData.length === 0 ? (
                  <p className="text-center text-muted-foreground">No data available</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={transactionTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={2}
                        dataKey="value"
                        label={(entry) => entry.name}
                      >
                        {transactionTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${value} Transactions`, name]} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {/* Transaction Volume Over Time */}
            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Transaction Volume Over Time</CardTitle>
                <CardDescription>Number of transactions by period</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                {isSummaryLoading ? (
                  <Skeleton className="h-72 w-full" />
                ) : volumeOverTimeData.length === 0 ? (
                  <p className="text-center text-muted-foreground">No data available</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={volumeOverTimeData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="period" 
                        angle={-45} 
                        textAnchor="end" 
                        height={70}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis />
                      <Tooltip formatter={(value, name) => [value, name]} />
                      <Legend />
                      <Bar dataKey="Buys" fill="#4CAF50" stackId="a" />
                      <Bar dataKey="Sells" fill="#F44336" stackId="a" />
                      <Bar dataKey="Other" fill="#9E9E9E" stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="details">
          {/* Transaction Filters */}
          <Card className="bg-white mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Filter Transactions</CardTitle>
              <CardDescription>Refine the transaction list</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="space-y-2 flex-1">
                  <Label>Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products, references..."
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <X
                        className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer"
                        onClick={() => setSearchQuery('')}
                      />
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Transaction Type</Label>
                  <Select value={transactionType} onValueChange={setTransactionType}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {uniqueTransactionTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Product Type</Label>
                  <Select value={productType} onValueChange={setProductType}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Select product type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {uniqueProductTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <Button variant="outline" onClick={() => {
                  setSearchQuery('');
                  setTransactionType('all');
                  setProductType('all');
                }}>
                  Reset Filters
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Transaction Table */}
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Transaction Details</CardTitle>
              <CardDescription>
                {isTransactionsLoading 
                  ? 'Loading transactions...' 
                  : `Showing ${sortedTransactions.length} of ${transactions?.length || 0} transactions`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px] cursor-pointer" onClick={() => handleSortChange('date')}>
                        Date
                        {sortBy === 'date' && (
                          sortDirection === 'asc' 
                            ? <ArrowUp className="ml-1 h-4 w-4 inline" /> 
                            : <ArrowDown className="ml-1 h-4 w-4 inline" />
                        )}
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSortChange('transactionType')}>
                        Type
                        {sortBy === 'transactionType' && (
                          sortDirection === 'asc' 
                            ? <ArrowUp className="ml-1 h-4 w-4 inline" /> 
                            : <ArrowDown className="ml-1 h-4 w-4 inline" />
                        )}
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSortChange('productType')}>
                        Product Type
                        {sortBy === 'productType' && (
                          sortDirection === 'asc' 
                            ? <ArrowUp className="ml-1 h-4 w-4 inline" /> 
                            : <ArrowDown className="ml-1 h-4 w-4 inline" />
                        )}
                      </TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSortChange('productName')}>
                        Product Name
                        {sortBy === 'productName' && (
                          sortDirection === 'asc' 
                            ? <ArrowUp className="ml-1 h-4 w-4 inline" /> 
                            : <ArrowDown className="ml-1 h-4 w-4 inline" />
                        )}
                      </TableHead>
                      <TableHead className="text-right cursor-pointer" onClick={() => handleSortChange('amount')}>
                        Amount
                        {sortBy === 'amount' && (
                          sortDirection === 'asc' 
                            ? <ArrowUp className="ml-1 h-4 w-4 inline" /> 
                            : <ArrowDown className="ml-1 h-4 w-4 inline" />
                        )}
                      </TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isTransactionsLoading ? (
                      Array(5).fill(0).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                        </TableRow>
                      ))
                    ) : sortedTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          No transactions found matching the current filters.
                        </TableCell>
                      </TableRow>
                    ) : (
                      sortedTransactions.map((transaction) => {
                        return (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            {transaction.transactionDate && format(new Date(transaction.transactionDate), 'dd MMM yyyy')}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={`
                                ${transaction.transactionType === 'buy' && 'bg-green-50 text-green-700 border-green-200'} 
                                ${transaction.transactionType === 'sell' && 'bg-red-50 text-red-700 border-red-200'}
                                ${transaction.transactionType === 'dividend' && 'bg-blue-50 text-blue-700 border-blue-200'}
                                ${transaction.transactionType === 'interest' && 'bg-purple-50 text-purple-700 border-purple-200'}
                                ${transaction.transactionType === 'fee' && 'bg-orange-50 text-orange-700 border-orange-200'}
                                ${transaction.transactionType === 'deposit' && 'bg-teal-50 text-teal-700 border-teal-200'}
                                ${transaction.transactionType === 'withdrawal' && 'bg-gray-50 text-gray-700 border-gray-200'}
                              `
                            }
                          >
                            {transaction.transactionType.charAt(0).toUpperCase() + transaction.transactionType.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>{transaction.productType}</TableCell>
                        <TableCell>{transaction.productName}</TableCell>
                        <TableCell className="text-right">
                          <span className={transaction.transactionType === 'buy' || transaction.transactionType === 'fee' ? 'text-red-600' : 'text-green-600'}>
                            {transaction.transactionType === 'buy' || transaction.transactionType === 'fee' ? '-' : '+'}
                            {formatCurrency(transaction.amount, transaction.currencyCode)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={transaction.status === 'completed' ? 'outline' : 'secondary'}>
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  }</TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Product Type Distribution */}
            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Product Distribution</CardTitle>
                <CardDescription>Transaction distribution by product type</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                {isTransactionsLoading ? (
                  <Skeleton className="h-72 w-full" />
                ) : productTypeData.length === 0 ? (
                  <p className="text-center text-muted-foreground">No data available</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={productTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={2}
                        dataKey="value"
                        label={(entry) => entry.name}
                      >
                        {productTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${value} Transactions`, name]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            
            {/* Transaction Value Over Time */}
            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Transaction Value Over Time</CardTitle>
                <CardDescription>Total transaction value by period</CardDescription>
              </CardHeader>
              <CardContent className="h-72">
                {isSummaryLoading ? (
                  <Skeleton className="h-72 w-full" />
                ) : volumeOverTimeData.length === 0 ? (
                  <p className="text-center text-muted-foreground">No data available</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={volumeOverTimeData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="period" 
                        angle={-45} 
                        textAnchor="end" 
                        height={70}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis />
                      <Tooltip formatter={(value, name) => [formatCurrency(value), name]} />
                      <Legend />
                      <Bar dataKey="totalAmount" name="Total Value" fill="#FF8042" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {/* Transaction Summary Table */}
            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Period Summary</CardTitle>
                <CardDescription>Transaction summary by {groupBy}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Period</TableHead>
                        <TableHead>Transactions</TableHead>
                        <TableHead>Buy</TableHead>
                        <TableHead>Sell</TableHead>
                        <TableHead>Other</TableHead>
                        <TableHead className="text-right">Total Amount</TableHead>
                        <TableHead className="text-right">Fees & Taxes</TableHead>
                        <TableHead className="text-right">Net Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isSummaryLoading ? (
                        Array(5).fill(0).map((_, index) => (
                          <TableRow key={index}>
                            <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          </TableRow>
                        ))
                      ) : !transactionSummary || transactionSummary.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-4">
                            No summary data available for the selected period.
                          </TableCell>
                        </TableRow>
                      ) : (
                        transactionSummary.map((summary) => (
                          <TableRow key={summary.period}>
                            <TableCell>{summary.period}</TableCell>
                            <TableCell>{summary.transactionCount}</TableCell>
                            <TableCell>{summary.buyCount}</TableCell>
                            <TableCell>{summary.sellCount}</TableCell>
                            <TableCell>{summary.otherCount}</TableCell>
                            <TableCell className="text-right">{formatCurrency(summary.totalAmount)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(summary.totalFees + summary.totalTaxes)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(summary.netAmount)}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}