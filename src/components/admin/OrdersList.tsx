import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import { formatPrice } from '@/utils/formatPrice';
import { Search, Eye, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'placed', label: 'Placed' },
  { value: 'paid', label: 'Paid' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'canceled', label: 'Canceled' },
  { value: 'refunded', label: 'Refunded' }
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'total_desc', label: 'Total High → Low' },
  { value: 'total_asc', label: 'Total Low → High' },
  { value: 'status', label: 'By Status' }
];

const ORDERS_PER_PAGE = 20;

const OrdersList = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [totalMin, setTotalMin] = useState('');
  const [totalMax, setTotalMax] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch orders with items count
  const { data: orders, isLoading } = useQuery({
    queryKey: ['admin-orders', statusFilter, dateFrom, dateTo],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      if (dateFrom) {
        query = query.gte('created_at', dateFrom);
      }

      if (dateTo) {
        query = query.lte('created_at', dateTo + 'T23:59:59');
      }

      const { data: ordersData, error } = await query;
      if (error) throw error;

      // Fetch item counts and custom bundle info for each order
      if (ordersData && ordersData.length > 0) {
        const orderIds = ordersData.map(o => o.id);
        const { data: itemsData, error: itemsError } = await supabase
          .from('order_items')
          .select('order_id, item_type')
          .in('order_id', orderIds);

        if (itemsError) {
          console.error('Error fetching item counts:', itemsError);
        } else {
          // Count items per order and check for custom bundles
          const itemCounts = itemsData?.reduce((acc: Record<string, number>, item) => {
            acc[item.order_id] = (acc[item.order_id] || 0) + 1;
            return acc;
          }, {}) || {};

          const hasCustomBundle = itemsData?.reduce((acc: Record<string, boolean>, item) => {
            if (item.item_type === 'custom_bundle') {
              acc[item.order_id] = true;
            }
            return acc;
          }, {}) || {};

          // Add item counts and custom bundle flags to orders
          return ordersData.map(order => ({
            ...order,
            itemCount: itemCounts[order.id] || 0,
            hasCustomBundle: hasCustomBundle[order.id] || false
          }));
        }
      }

      return ordersData || [];
    }
  });

  // Filter and sort orders
  const filteredAndSortedOrders = useMemo(() => {
    if (!orders) return [];

    let filtered = [...orders];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(query) ||
        order.customer_name?.toLowerCase().includes(query) ||
        order.customer_email?.toLowerCase().includes(query) ||
        order.customer_phone?.toLowerCase().includes(query)
      );
    }

    // Total range filter
    if (totalMin) {
      filtered = filtered.filter(order => order.total_bani >= parseFloat(totalMin) * 100);
    }
    if (totalMax) {
      filtered = filtered.filter(order => order.total_bani <= parseFloat(totalMax) * 100);
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'total_desc':
        filtered.sort((a, b) => b.total_bani - a.total_bani);
        break;
      case 'total_asc':
        filtered.sort((a, b) => a.total_bani - b.total_bani);
        break;
      case 'status':
        filtered.sort((a, b) => a.status.localeCompare(b.status));
        break;
    }

    return filtered;
  }, [orders, searchQuery, sortBy, totalMin, totalMax]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedOrders.length / ORDERS_PER_PAGE);
  const paginatedOrders = filteredAndSortedOrders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery, sortBy, dateFrom, dateTo, totalMin, totalMax]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getStatusBadgeVariant = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      draft: 'outline',
      placed: 'secondary',
      paid: 'default',
      shipped: 'default',
      delivered: 'default',
      canceled: 'destructive',
      cancelled: 'destructive',
      refunded: 'destructive'
    };
    return variants[status] || 'outline';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Loading orders...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Orders Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID, name, email, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Input
                type="date"
                placeholder="From"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="flex-1"
              />
              <Input
                type="date"
                placeholder="To"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          {/* Total Range */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              placeholder="Min total (MDL)"
              value={totalMin}
              onChange={(e) => setTotalMin(e.target.value)}
            />
            <Input
              type="number"
              placeholder="Max total (MDL)"
              value={totalMax}
              onChange={(e) => setTotalMax(e.target.value)}
            />
          </div>

          {/* Orders Table */}
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedOrders.map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm">
                        {order.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={getStatusBadgeVariant(order.status)}>
                            {order.status}
                          </Badge>
                          {order.hasCustomBundle && (
                            <Badge variant="secondary" className="text-xs">
                              Custom Bundle
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{order.customer_name || 'N/A'}</div>
                          <div className="text-xs text-muted-foreground">
                            {order.customer_phone || order.customer_email || ''}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatPrice(order.total_bani)}
                      </TableCell>
                      <TableCell>
                        {order.itemCount || 0}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/admin/orders/${order.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>

                  {currentPage > 2 && (
                    <PaginationItem>
                      <PaginationLink onClick={() => handlePageChange(1)} className="cursor-pointer">
                        1
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  {currentPage > 3 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  {currentPage > 1 && (
                    <PaginationItem>
                      <PaginationLink onClick={() => handlePageChange(currentPage - 1)} className="cursor-pointer">
                        {currentPage - 1}
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationLink isActive className="cursor-default">
                      {currentPage}
                    </PaginationLink>
                  </PaginationItem>

                  {currentPage < totalPages && (
                    <PaginationItem>
                      <PaginationLink onClick={() => handlePageChange(currentPage + 1)} className="cursor-pointer">
                        {currentPage + 1}
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  {currentPage < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  {currentPage < totalPages - 1 && (
                    <PaginationItem>
                      <PaginationLink onClick={() => handlePageChange(totalPages)} className="cursor-pointer">
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
              <p className="text-center text-sm text-muted-foreground mt-2">
                Showing {paginatedOrders.length} of {filteredAndSortedOrders.length} orders (Page {currentPage} of {totalPages})
              </p>
            </div>
          )}

          {totalPages <= 1 && (
            <div className="text-sm text-muted-foreground">
              Showing {filteredAndSortedOrders.length} of {orders?.length || 0} orders
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersList;

