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
      // Remove fee transactions
      if (transaction.transactionType === 'fee') {
        return false;
      }
      
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
      // Exclude fee transactions from the chart
      if (transaction.transactionType !== 'fee') {
        const type = transaction.transactionType;
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      }
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
      // Exclude fee transactions from the product chart
      if (transaction.transactionType !== 'fee') {
        const type = transaction.productType;
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      }
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
                      <SelectItem value="transfer">Transfer</SelectItem>
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
                      <SelectItem value="fixed_deposit">Fixed Deposit</SelectItem>
                      <SelectItem value="bond">Bond</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="productName" className="text-right">
                    Product Name
                  </Label>
                  <Input
                    id="productName"
                    placeholder="Enter product name"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">
                    Amount
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="Enter amount"
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save Transaction</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Date range and filter controls */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Date Range</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(startDate, 'PPP')}
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
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(endDate, 'PPP')}
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
            </div>
            
            <div className="space-y-2">
              <Label>Transaction Type</Label>
              <Select 
                value={transactionType} 
                onValueChange={setTransactionType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select transaction type" />
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
              <Select 
                value={productType} 
                onValueChange={setProductType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  {uniqueProductTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setSearchQuery('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Transaction metrics overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isTransactionsLoading ? (
                <Skeleton className="h-8 w-28" />
              ) : (
                formatCurrency(metrics.totalValue)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              From {transactions?.length || 0} transactions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Buy/Sell Ratio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isTransactionsLoading ? (
                <Skeleton className="h-8 w-28" />
              ) : (
                churnRatio.toFixed(2)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.buyCount} buys, {metrics.sellCount} sells
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Average Transaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isTransactionsLoading ? (
                <Skeleton className="h-8 w-28" />
              ) : (
                formatCurrency(metrics.averageTransactionValue)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {((metrics.averageTransactionValue / metrics.totalValue) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Fees & Taxes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isTransactionsLoading ? (
                <Skeleton className="h-8 w-28" />
              ) : (
                formatCurrency(metrics.totalFees)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {((metrics.totalFees / metrics.totalValue) * 100).toFixed(2)}% of total value
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Transaction charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Transaction Types</CardTitle>
            <CardDescription>Distribution of transaction types over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {isTransactionsLoading ? (
                <div className="h-full w-full flex items-center justify-center">
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : transactionTypeData.length === 0 ? (
                <div className="h-full w-full flex items-center justify-center">
                  <p className="text-muted-foreground">No transaction data available</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={transactionTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {transactionTypeData.map((entry, index) => {
                        return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                      })}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} Transactions`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Transaction Volume Over Time</CardTitle>
            <CardDescription>Number and value of transactions by period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {isSummaryLoading ? (
                <div className="h-full w-full flex items-center justify-center">
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : volumeOverTimeData.length === 0 ? (
                <div className="h-full w-full flex items-center justify-center">
                  <p className="text-muted-foreground">No transaction data available</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeOverTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip formatter={(value, name) => {
                      if (name === 'totalAmount') {
                        return [formatCurrency(value as number), 'Total Value'];
                      }
                      return [value, name];
                    }} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="Buys" stackId="a" fill="#8884d8" />
                    <Bar yAxisId="left" dataKey="Sells" stackId="a" fill="#82ca9d" />
                    <Bar yAxisId="left" dataKey="Other" stackId="a" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Product Types</CardTitle>
            <CardDescription>Distribution of products by type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {isTransactionsLoading ? (
                <div className="h-full w-full flex items-center justify-center">
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : productTypeData.length === 0 ? (
                <div className="h-full w-full flex items-center justify-center">
                  <p className="text-muted-foreground">No transaction data available</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={productTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {productTypeData.map((entry, index) => {
                        return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                      })}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} Transactions`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Transaction Summary</CardTitle>
            <CardDescription>
              <Select 
                value={groupBy} 
                onValueChange={(value) => setGroupBy(value as any)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Group by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Daily</SelectItem>
                  <SelectItem value="week">Weekly</SelectItem>
                  <SelectItem value="month">Monthly</SelectItem>
                  <SelectItem value="quarter">Quarterly</SelectItem>
                  <SelectItem value="year">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Transactions</TableHead>
                    <TableHead>Buys/Sells</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="text-right">Fees & Taxes</TableHead>
                    <TableHead className="text-right">Net Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isSummaryLoading ? (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <Skeleton className="h-10 w-full" />
                      </TableCell>
                    </TableRow>
                  ) : !transactionSummary || transactionSummary.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        No transaction data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactionSummary.map(summary => (
                      <TableRow key={summary.period}>
                        <TableCell className="font-medium">{summary.period}</TableCell>
                        <TableCell>{summary.transactionCount}</TableCell>
                        <TableCell>{summary.buyCount}/{summary.sellCount}</TableCell>
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
      
      {/* Transactions table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
          <CardDescription>Showing {sortedTransactions.length} of {transactions?.length || 0} transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSortChange('date')}
                      className="px-0 font-medium flex items-center"
                    >
                      Date
                      {sortBy === 'date' && (
                        sortDirection === 'asc' ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSortChange('transactionType')}
                      className="px-0 font-medium flex items-center"
                    >
                      Type
                      {sortBy === 'transactionType' && (
                        sortDirection === 'asc' ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSortChange('productType')}
                      className="px-0 font-medium flex items-center"
                    >
                      Product Type
                      {sortBy === 'productType' && (
                        sortDirection === 'asc' ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSortChange('productName')}
                      className="px-0 font-medium flex items-center"
                    >
                      Product Name
                      {sortBy === 'productName' && (
                        sortDirection === 'asc' ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      onClick={() => handleSortChange('amount')}
                      className="px-0 font-medium flex items-center justify-end w-full"
                    >
                      Amount
                      {sortBy === 'amount' && (
                        sortDirection === 'asc' ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isTransactionsLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell colSpan={6}>
                        <Skeleton className="h-10 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : sortedTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No transactions found matching the filters
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedTransactions.map(transaction => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {format(new Date(transaction.transactionDate), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell className="capitalize">{transaction.transactionType}</TableCell>
                      <TableCell className="capitalize">{transaction.productType}</TableCell>
                      <TableCell>{transaction.productName}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={transaction.status === 'completed' ? 'outline' : 'secondary'}>
                          {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}