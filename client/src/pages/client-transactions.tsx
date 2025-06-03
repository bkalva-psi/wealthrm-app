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
  Target,
  User,
  PieChart,
  Receipt,
  FileBarChart,
  Lightbulb,
  ChevronDown
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { getTierColor } from '@/lib/utils';
import { ClientPageLayout } from '@/components/layout/ClientPageLayout';

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
  const [selectedPeriod, setSelectedPeriod] = useState<'1w' | '1m' | '3m' | 'all'>('all');
  const [startDate, setStartDate] = useState<Date>(new Date(0)); // Start with very old date for "all"
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [transactionType, setTransactionType] = useState<string>('all');
  const [productType, setProductType] = useState<string>('all');
  const [securityFilter, setSecurityFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Pagination state
  const [visibleCount, setVisibleCount] = useState<number>(10);
  const ITEMS_PER_PAGE = 10;
  
  // Filter UI state
  const [filtersExpanded, setFiltersExpanded] = useState<boolean>(false);
  
  // Quick date filter handler
  const handlePeriodFilter = (period: '1w' | '1m' | '3m' | 'all') => {
    console.log(`Applying period filter: ${period}`);
    setSelectedPeriod(period);
    setVisibleCount(ITEMS_PER_PAGE); // Reset visible count when changing period
    
    if (period === 'all') {
      // For "all", don't apply date filtering
      setStartDate(new Date(0)); // Set to very old date
      setEndDate(new Date()); // Current date
      return;
    }
    
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
  };

  // Pagination handlers
  const handleShowMore = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  };

  const handleShowLess = () => {
    setVisibleCount(ITEMS_PER_PAGE);
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
      lastTransactionDate: null,
      totalFees: 0,
      largestTransaction: 0
    };
    
    const totalTransactions = filteredTransactions.length;
    const totalValue = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    const buyCount = filteredTransactions.filter(t => t.transactionType === 'buy').length;
    const sellCount = filteredTransactions.filter(t => t.transactionType === 'sell').length;
    
    // Find the most recent transaction date
    const sortedByDate = [...filteredTransactions].sort((a, b) => 
      new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
    );
    const lastTransactionDate = sortedByDate.length > 0 ? sortedByDate[0].transactionDate : null;
    
    const totalFees = filteredTransactions.reduce((sum, t) => sum + (t.fees || 0) + (t.taxes || 0), 0);
    const largestTransaction = Math.max(...filteredTransactions.map(t => t.amount));
    
    return {
      totalTransactions,
      totalValue,
      buyCount,
      sellCount,
      lastTransactionDate,
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
    <ClientPageLayout client={client} isLoading={isClientLoading} clientId={clientId}>
                <>
                  <button 
                    onClick={() => window.location.hash = `/clients/${clientId}/personal`}
                    className="text-xl font-semibold text-card-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    {client?.fullName}
                  </button>
                  {/* Line 2: Phone Number */}
                  {client?.phone && (
                    <div className="mt-1 flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={`tel:${client.phone}`}
                        className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
                        title="Call client"
                      >
                        {client.phone}
                      </a>
                    </div>
                  )}
                  
                  {/* Line 3: Email */}
                  {client?.email && (
                    <div className="mt-1 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a 
                        href={`mailto:${client.email}`}
                        className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
                        title="Send email to client"
                      >
                        {client.email}
                      </a>
                    </div>
                  )}
                  

                </>
              )}
            </div>
          </div>


        </div>
      </div>

      {/* Page Title Band with Navigation */}
      <div className="bg-card border-b border-border px-1 py-4">
        <h2 className="text-2xl font-bold text-foreground px-5 mb-3">Transactions</h2>
        
        {/* Navigation Icons */}
        <div className="grid grid-cols-7 gap-1 px-1">
          <button 
            className="flex items-center justify-center px-1 py-2 rounded-lg hover:bg-muted transition-colors h-12 w-full"
            onClick={() => window.location.hash = `/clients/${clientId}/personal`}
            title="Personal Profile"
          >
            <User className="h-6 w-6 text-muted-foreground" />
          </button>
          
          <button 
            className="flex items-center justify-center px-1 py-2 rounded-lg hover:bg-muted transition-colors h-12 w-full"
            onClick={() => window.location.hash = `/clients/${clientId}/portfolio`}
            title="Portfolio"
          >
            <PieChart className="h-6 w-6 text-muted-foreground" />
          </button>
          
          <button 
            className="flex items-center justify-center px-1 py-2 rounded-lg bg-primary/10 border border-primary/20 h-12 w-full"
            title="Transactions"
          >
            <Receipt className="h-6 w-6 text-primary" />
          </button>
          
          <button 
            className="flex items-center justify-center px-1 py-2 rounded-lg hover:bg-muted transition-colors h-12 w-full"
            onClick={() => window.location.hash = `/clients/${clientId}/appointments`}
            title="Appointments"
          >
            <CalendarIconNav className="h-6 w-6 text-muted-foreground" />
          </button>
          
          <button 
            className="flex items-center justify-center px-1 py-2 rounded-lg hover:bg-muted transition-colors h-12 w-full"
            onClick={() => window.location.hash = `/clients/${clientId}/communications`}
            title="Notes"
          >
            <FileText className="h-6 w-6 text-muted-foreground" />
          </button>
          
          <button 
            className="flex items-center justify-center px-1 py-2 rounded-lg hover:bg-muted transition-colors h-12 w-full"
            onClick={() => {
              // Check if mobile device
              const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
              
              if (isMobile) {
                // On mobile, open in same tab for better experience
                window.location.href = `/api/clients/${clientId}/portfolio-report`;
              } else {
                // On desktop, open in new tab
                window.open(`/api/clients/${clientId}/portfolio-report`, '_blank');
              }
            }}
            title="Portfolio Report"
          >
            <FileBarChart className="h-6 w-6 text-muted-foreground" />
          </button>
          
          <button 
            className="flex items-center justify-center px-1 py-2 rounded-lg hover:bg-muted transition-colors h-12 w-full"
            onClick={() => window.location.hash = `/clients/${clientId}/insights`}
            title="Investment Ideas"
          >
            <Lightbulb className="h-6 w-6 text-muted-foreground" />
          </button>
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
      


      {/* Filters - Collapsible */}
      <Card className="overflow-hidden">
        <div 
          className="p-4 bg-muted border-b border-border cursor-pointer hover:bg-muted/80 transition-colors"
          onClick={() => setFiltersExpanded(!filtersExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium text-foreground">Filters</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={(e) => {
                  e.stopPropagation();
                  exportToCSV();
                }}
                className="ml-4"
              >
                <Download className="h-4 w-4 mr-1" />
                Export CSV
              </Button>
              {(selectedPeriod !== 'all' || transactionType !== 'all' || productType !== 'all' || securityFilter !== 'all') && (
                <div className="flex items-center space-x-2 ml-2">
                  {selectedPeriod !== 'all' && (
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                      {selectedPeriod === '1w' ? 'LAST WEEK' :
                       selectedPeriod === '1m' ? 'LAST MONTH' :
                       selectedPeriod === '3m' ? 'LAST 3 MONTHS' : 
                       selectedPeriod.toUpperCase()}
                    </span>
                  )}
                  {transactionType !== 'all' && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                      {transactionType.toUpperCase()}
                    </span>
                  )}
                  {productType !== 'all' && (
                    <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                      {productType.toUpperCase()}
                    </span>
                  )}
                  {securityFilter !== 'all' && (
                    <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">
                      {securityFilter}
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <ChevronDown 
                className={`h-5 w-5 text-muted-foreground transition-transform ${filtersExpanded ? 'rotate-180' : ''}`}
              />
            </div>
          </div>
        </div>
        
        {filtersExpanded && (
          <div className="p-4 space-y-4">
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Date Range</Label>
              <div className="flex gap-2">
                <Button
                  variant={selectedPeriod === '1w' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePeriodFilter('1w')}
                  className="flex-1"
                >
                  1W
                </Button>
                <Button
                  variant={selectedPeriod === '1m' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePeriodFilter('1m')}
                  className="flex-1"
                >
                  1M
                </Button>
                <Button
                  variant={selectedPeriod === '3m' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePeriodFilter('3m')}
                  className="flex-1"
                >
                  3M
                </Button>
                <Button
                  variant={selectedPeriod === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePeriodFilter('all')}
                  className="flex-1"
                >
                  ALL
                </Button>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Transaction Type</Label>
              <Select 
                value={transactionType} 
                onValueChange={setTransactionType}
              >
                <SelectTrigger className="w-full">
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
            
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Product Type</Label>
              <Select 
                value={productType} 
                onValueChange={setProductType}
              >
                <SelectTrigger className="w-full">
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
            
            <div>
              <Label className="text-sm font-medium text-foreground mb-2 block">Security</Label>
              <Select 
                value={securityFilter} 
                onValueChange={setSecurityFilter}
              >
                <SelectTrigger className="w-full">
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
            
            {(selectedPeriod !== 'all' || transactionType !== 'all' || productType !== 'all' || securityFilter !== 'all') && (
              <div className="pt-2">
                <Button 
                  onClick={() => {
                    setSelectedPeriod('all');
                    setTransactionType('all');
                    setProductType('all');
                    setSecurityFilter('all');
                    handlePeriodFilter('all');
                  }} 
                  variant="outline" 
                  className="w-full"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        )}
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
          <span className="text-xs text-muted-foreground">Last Transaction</span>
          <span className="text-lg font-semibold">
            {isTransactionsLoading ? (
              <Skeleton className="h-6 w-20" />
            ) : (
              metrics.lastTransactionDate ? format(new Date(metrics.lastTransactionDate), 'dd MMM') : 'N/A'
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
      
      {/* Transaction Details Cards */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Transaction Details</h3>
          <p className="text-sm text-muted-foreground">Showing {Math.min(visibleCount, sortedTransactions.length)} of {sortedTransactions.length} transactions</p>
        </div>
        
        {isTransactionsLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : sortedTransactions.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No transactions found. Try adjusting your filters.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {sortedTransactions.slice(0, visibleCount).map((transaction) => (
              <Card key={transaction.id} className="p-4">
                <div className="flex flex-col space-y-3">
                  {/* Header Row */}
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-lg">{transaction.productName}</p>
                      <p className="text-sm text-muted-foreground">{transaction.productType.charAt(0).toUpperCase() + transaction.productType.slice(1)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">{formatCurrency(transaction.totalAmount)}</p>
                      <p className="text-sm text-muted-foreground">{format(new Date(transaction.transactionDate), 'dd MMM yyyy')}</p>
                    </div>
                  </div>
                  
                  {/* Details Row - Two Column Layout */}
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                    <div>
                      <p className="text-sm text-muted-foreground">Type</p>
                      <p className="font-medium">{transaction.transactionType.charAt(0).toUpperCase() + transaction.transactionType.slice(1)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Amount</p>
                      <p className="font-medium">{formatCurrency(transaction.amount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="font-medium">{transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Fees</p>
                      <p className="font-medium">{formatCurrency(transaction.fees || 0)}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            
            {/* Pagination Controls */}
            {sortedTransactions.length > ITEMS_PER_PAGE && (
              <div className="flex justify-center space-x-4 pt-6">
                {visibleCount < sortedTransactions.length && (
                  <Button 
                    variant="outline" 
                    onClick={handleShowMore}
                    className="px-6"
                  >
                    Show More ({Math.min(ITEMS_PER_PAGE, sortedTransactions.length - visibleCount)} more)
                  </Button>
                )}
                {visibleCount > ITEMS_PER_PAGE && (
                  <Button 
                    variant="ghost" 
                    onClick={handleShowLess}
                    className="px-6"
                  >
                    Show Less
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </ClientPageLayout>
  );
}