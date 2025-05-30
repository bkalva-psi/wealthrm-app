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
import { format, isValid, parseISO, subMonths, subDays } from 'date-fns';
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
  Plus,
  Phone,
  Mail,
  BarChart4,
  MessageCircle,
  Calendar as CalendarIconNav,
  Wallet,
  FileText,
  Target
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { getTierColor } from '@/lib/utils';

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
  const [transactionType, setTransactionType] = useState<string>('all');
  const [productType, setProductType] = useState<string>('all');
  const [securityFilter, setSecurityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Quick date filter handler
  const handleQuickDateFilter = (period: '1w' | '1m' | '3m') => {
    console.log(`Applying quick filter: ${period}`);
    const end = new Date();
    let start: Date;
    
    switch (period) {
      case '1w':
        start = subDays(end, 7);
        break;
      case '1m':
        start = subMonths(end, 1);
        break;
      case '3m':
      default:
        start = subMonths(end, 3);
        break;
    }
    
    setStartDate(start);
    setEndDate(end);
    
    // Force refresh
    setTimeout(() => {
      window.location.hash = window.location.hash;
    }, 100);
  };
  
  // Get client data
  const { data: client, isLoading: isClientLoading } = useApiQuery<Client>({
    queryKey: [`/api/clients/${clientId}`],
    enabled: !!clientId
  });
  
  // Get all transaction data - we'll filter it client-side
  const { data: transactions, isLoading: isTransactionsLoading } = useApiQuery<Transaction[]>({
    queryKey: [
      `/api/clients/${clientId}/transactions`,
    ],
    enabled: !!clientId
  });
  
  // Filter transactions based on date range, security filter and other filters
  const filteredTransactions = React.useMemo(() => {
    if (!transactions) return [];
    
    console.log(`Filtering transactions between ${startDate.toISOString()} and ${endDate.toISOString()}`);
    
    return transactions.filter(transaction => {
      // Remove fee transactions
      if (transaction.transactionType === 'fee') {
        return false;
      }
      
      // Apply date range filter
      const txDate = new Date(transaction.transactionDate);
      if (txDate < startDate || txDate > endDate) {
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
      
      // Apply security filter
      if (securityFilter !== 'all' && transaction.productName !== securityFilter) {
        return false;
      }
      
      return true;
    });
  }, [transactions, transactionType, productType, securityFilter, startDate, endDate]);
  
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

  // Format value for display
  const formatValue = (value: number): string => {
    if (value >= 10000000) {
      return (value / 10000000).toFixed(2) + ' Cr';
    } else if (value >= 100000) {
      return (value / 100000).toFixed(2) + ' L';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(2) + 'K';
    } else {
      return value.toFixed(2);
    }
  };
  
  // Calculate metrics for dashboard
  const metrics = React.useMemo(() => {
    if (!filteredTransactions || filteredTransactions.length === 0) return {
      totalTransactions: 0,
      totalValue: 0,
      buyCount: 0,
      sellCount: 0,
      averageTransactionValue: 0,
      totalFees: 0,
      largestTransaction: 0
    };
    
    const totalTransactions = filteredTransactions.length;
    const totalValue = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    const buyCount = filteredTransactions.filter(t => t.transactionType === 'buy').length;
    const sellCount = filteredTransactions.filter(t => t.transactionType === 'sell').length;
    const averageTransactionValue = totalTransactions > 0 ? totalValue / totalTransactions : 0;
    const totalFees = filteredTransactions.reduce((sum, t) => sum + (t.fees || 0) + (t.taxes || 0), 0);
    const largestTransaction = Math.max(...filteredTransactions.map(t => t.amount));
    
    return {
      totalTransactions,
      totalValue,
      buyCount,
      sellCount,
      averageTransactionValue,
      totalFees,
      largestTransaction
    };
  }, [filteredTransactions]);
  
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
      {/* Consistent Header Band */}
      <div className={`bg-white border rounded-lg p-4 mb-6 shadow-sm border-l-4 ${client ? getTierColor(client.tier).border.replace('border-', 'border-l-') : 'border-l-slate-300'}`}>
        <div className="flex items-center justify-between">
          {/* Left side - Back arrow and client info */}
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => window.location.hash = `/clients`}
              className="mr-4 p-2"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div>
              {isClientLoading ? (
                <div className="space-y-1">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ) : (
                <>
                  <button 
                    onClick={() => window.location.hash = `/clients/${clientId}/personal`}
                    className="text-xl font-semibold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    {client?.fullName}
                  </button>
                  {/* Line 2: Phone Number */}
                  {client?.phone && (
                    <div className="mt-1 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <a 
                        href={`tel:${client.phone}`}
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                        title="Call client"
                      >
                        {client.phone}
                      </a>
                    </div>
                  )}
                  
                  {/* Line 3: Email */}
                  {client?.email && (
                    <div className="mt-1 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <a 
                        href={`mailto:${client.email}`}
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                        title="Send email to client"
                      >
                        {client.email}
                      </a>
                    </div>
                  )}
                  
                  {/* Line 4: Navigation Icons */}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <button 
                      onClick={() => window.location.hash = `/clients/${clientId}/personal`}
                      className="p-1 hover:bg-slate-100 rounded"
                      title="Personal Profile"
                    >
                      <BarChart4 className="h-4 w-4 text-slate-600" />
                    </button>
                    <button 
                      onClick={() => window.location.hash = `/clients/${clientId}/portfolio`}
                      className="p-1 hover:bg-slate-100 rounded"
                      title="Portfolio"
                    >
                      <Wallet className="h-4 w-4 text-slate-600" />
                    </button>
                    <button 
                      className="p-1 bg-blue-100 rounded"
                      title="Transactions"
                    >
                      <ArrowUpDown className="h-4 w-4 text-slate-400" />
                    </button>
                    <button 
                      onClick={() => window.location.hash = `/clients/${clientId}/appointments`}
                      className="p-1 hover:bg-slate-100 rounded"
                      title="Appointments"
                    >
                      <CalendarIconNav className="h-4 w-4 text-slate-600" />
                    </button>
                    <button 
                      onClick={() => window.location.hash = `/clients/${clientId}/communications`}
                      className="p-1 hover:bg-slate-100 rounded"
                      title="Communications"
                    >
                      <MessageCircle className="h-4 w-4 text-slate-600" />
                    </button>
                    <button 
                      className="p-1 hover:bg-slate-100 rounded"
                      title="Portfolio Report"
                    >
                      <FileText className="h-4 w-4 text-slate-600" />
                    </button>
                    <button 
                      className="p-1 hover:bg-slate-100 rounded"
                      title="Investment Recommendations"
                    >
                      <Target className="h-4 w-4 text-slate-600" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>


        </div>
      </div>

      {/* Page Description */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Transactions</h2>
          <p className="text-gray-600 mt-1">
            Detailed transaction history with filtering and analysis tools
          </p>
        </div>
      </div>
      
      <Dialog>
        <DialogTrigger asChild>
          <div style={{ display: 'none' }}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Transaction
            </Button>
          </div>
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
                      <SelectValue placeholder="Transaction Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="buy">Buy</SelectItem>
                      <SelectItem value="sell">Sell</SelectItem>
                      <SelectItem value="dividend">Dividend</SelectItem>
                      <SelectItem value="interest">Interest</SelectItem>
                      <SelectItem value="deposit">Deposit</SelectItem>
                      <SelectItem value="withdrawal">Withdrawal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="productType" className="text-right">
                    Product
                  </Label>
                  <Select defaultValue="equity">
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Product Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equity">Equity</SelectItem>
                      <SelectItem value="mutual_fund">Mutual Fund</SelectItem>
                      <SelectItem value="bond">Bond</SelectItem>
                      <SelectItem value="fd">Fixed Deposit</SelectItem>
                      <SelectItem value="insurance">Insurance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">
                    Amount
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    className="col-span-3"
                    placeholder="Enter amount"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Input
                    id="description"
                    className="col-span-3"
                    placeholder="Enter description"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Submit</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
      
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Date Range */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Date Range</Label>
                  <div className="flex space-x-1">
                    <Button 
                      variant="outline" 
                      size="xs" 
                      onClick={() => handleQuickDateFilter('1w')}
                      className="h-6 text-xs px-2"
                    >
                      1w
                    </Button>
                    <Button 
                      variant="outline" 
                      size="xs" 
                      onClick={() => handleQuickDateFilter('1m')}
                      className="h-6 text-xs px-2"
                    >
                      1m
                    </Button>
                    <Button 
                      variant="outline" 
                      size="xs" 
                      onClick={() => handleQuickDateFilter('3m')}
                      className="h-6 text-xs px-2"
                    >
                      3m
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal text-xs sm:text-sm">
                        <CalendarIcon className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="truncate">{format(startDate, 'PP')}</span>
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
                      <Button variant="outline" className="w-full justify-start text-left font-normal text-xs sm:text-sm">
                        <CalendarIcon className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                        <span className="truncate">{format(endDate, 'PP')}</span>
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
              
              {/* Transaction Type */}
              <div className="space-y-2">
                <Label>Transaction Type</Label>
                <Select 
                  value={transactionType} 
                  onValueChange={setTransactionType}
                >
                  <SelectTrigger className="text-xs sm:text-sm">
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
              
              {/* Product Type */}
              <div className="space-y-2">
                <Label>Product Type</Label>
                <Select 
                  value={productType} 
                  onValueChange={setProductType}
                >
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue placeholder="Select product" />
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
              
              {/* Security Filter */}
              <div className="space-y-2">
                <Label>Security</Label>
                <Select 
                  value={securityFilter} 
                  onValueChange={setSecurityFilter}
                >
                  <SelectTrigger className="text-xs sm:text-sm">
                    <SelectValue placeholder="Select security" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Securities</SelectItem>
                    {transactions && [...new Set(transactions.map(t => t.productName))].sort().map(security => (
                      <SelectItem key={security} value={security}>
                        {security}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Compact Transaction Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <div className="bg-muted rounded-md p-3 flex flex-col">
          <span className="text-xs text-muted-foreground">Total Value</span>
          <span className="text-lg font-semibold">
            {isTransactionsLoading ? (
              <Skeleton className="h-6 w-20" />
            ) : (
              formatCurrency(metrics.totalValue)
            )}
          </span>
        </div>
        
        <div className="bg-muted rounded-md p-3 flex flex-col">
          <span className="text-xs text-muted-foreground">Buy/Sell</span>
          <span className="text-lg font-semibold">
            {isTransactionsLoading ? (
              <Skeleton className="h-6 w-20" />
            ) : (
              `${metrics.buyCount} : ${metrics.sellCount}`
            )}
          </span>
        </div>
        
        <div className="bg-muted rounded-md p-3 flex flex-col">
          <span className="text-xs text-muted-foreground">Avg. Value</span>
          <span className="text-lg font-semibold">
            {isTransactionsLoading ? (
              <Skeleton className="h-6 w-20" />
            ) : (
              formatCurrency(metrics.averageTransactionValue)
            )}
          </span>
        </div>
        
        <div className="bg-muted rounded-md p-3 flex flex-col">
          <span className="text-xs text-muted-foreground">Transactions</span>
          <span className="text-lg font-semibold">
            {isTransactionsLoading ? (
              <Skeleton className="h-6 w-20" />
            ) : (
              filteredTransactions.length
            )}
          </span>
        </div>
      </div>
      
      {/* Transaction Details Table */}
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
                      className="flex items-center justify-start p-0 h-auto font-medium"
                    >
                      Date
                      {sortBy === 'date' && (
                        sortDirection === 'asc' ? 
                          <ArrowUp className="ml-2 h-4 w-4" /> : 
                          <ArrowDown className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSortChange('transactionType')}
                      className="flex items-center justify-start p-0 h-auto font-medium"
                    >
                      Type
                      {sortBy === 'transactionType' && (
                        sortDirection === 'asc' ? 
                          <ArrowUp className="ml-2 h-4 w-4" /> : 
                          <ArrowDown className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSortChange('productType')}
                      className="flex items-center justify-start p-0 h-auto font-medium"
                    >
                      Product
                      {sortBy === 'productType' && (
                        sortDirection === 'asc' ? 
                          <ArrowUp className="ml-2 h-4 w-4" /> : 
                          <ArrowDown className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSortChange('productName')}
                      className="flex items-center justify-start p-0 h-auto font-medium"
                    >
                      Security
                      {sortBy === 'productName' && (
                        sortDirection === 'asc' ? 
                          <ArrowUp className="ml-2 h-4 w-4" /> : 
                          <ArrowDown className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">
                    <Button
                      variant="ghost"
                      onClick={() => handleSortChange('amount')}
                      className="flex items-center justify-end p-0 h-auto font-medium ml-auto"
                    >
                      Amount
                      {sortBy === 'amount' && (
                        sortDirection === 'asc' ? 
                          <ArrowUp className="ml-2 h-4 w-4" /> : 
                          <ArrowDown className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  </TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isTransactionsLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24">
                      <div className="flex flex-col gap-2">
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                        <Skeleton className="h-8 w-full" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : sortedTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No transactions found. Try adjusting your filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        {format(new Date(transaction.transactionDate), 'dd MMM yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          transaction.transactionType === 'buy' ? 'default' :
                          transaction.transactionType === 'sell' ? 'destructive' :
                          'secondary'
                        }>
                          {transaction.transactionType.charAt(0).toUpperCase() + transaction.transactionType.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {transaction.productType.charAt(0).toUpperCase() + transaction.productType.slice(1)}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {transaction.productName}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(transaction.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={
                          transaction.status === 'completed' ? 'outline' :
                          transaction.status === 'pending' ? 'secondary' :
                          'outline'
                        }>
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