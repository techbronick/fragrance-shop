import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatPrice } from '@/utils/formatPrice';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Package, User, MapPin, DollarSign, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { OrderWithItems, OrderItemSnapshot } from '@/types/orders';

// Renders a bundle's contents with a fallback to a live DB lookup when the snapshot
// is missing items or has incomplete product info (e.g., older orders or RLS issues
// at checkout time).
const BundleContents = ({ item, snapshot }: { item: any; snapshot: OrderItemSnapshot | null }) => {
  const snapshotItems = snapshot?.items ?? [];
  const snapshotComplete = snapshotItems.length > 0 && snapshotItems.every((s: any) => s.product);

  // Fall back to fetching live config_items when the snapshot is empty/incomplete and
  // we have a config_id to look up.
  const { data: liveItems, isLoading: liveLoading } = useQuery({
    queryKey: ['admin-bundle-fallback', item.id, item.config_id],
    enabled: !snapshotComplete && !!item.config_id && item.item_type === 'predefined_bundle',
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discovery_set_config_items')
        .select('slot_index, sku:skus(size_ml, label, product:products(id, brand, name))')
        .eq('config_id', item.config_id)
        .order('slot_index', { ascending: true });
      if (error) throw error;
      return (data ?? []).map((row: any) => ({
        slot_index: row.slot_index,
        size_ml: row.sku?.size_ml,
        sku_id: null,
        product: row.sku?.product
          ? { id: row.sku.product.id, brand: row.sku.product.brand, name: row.sku.product.name }
          : null,
      }));
    },
  });

  // Custom-bundle fallback: if snapshot has sku_ids but no product info, fetch SKUs live.
  const missingSkuIds = snapshotItems
    .filter((s: any) => !s.product && s.sku_id)
    .map((s: any) => s.sku_id);
  const { data: liveSkus } = useQuery({
    queryKey: ['admin-bundle-skus', item.id, missingSkuIds.join(',')],
    enabled: !snapshotComplete && missingSkuIds.length > 0,
    queryFn: async () => {
      // Try as SKU IDs first, then as product IDs
      const { data: byId } = await supabase
        .from('skus')
        .select('id, product_id, size_ml, product:products(id, brand, name)')
        .in('id', missingSkuIds);
      if (byId && byId.length > 0) return byId;
      const { data: byProduct } = await supabase
        .from('skus')
        .select('id, product_id, size_ml, product:products(id, brand, name)')
        .in('product_id', missingSkuIds);
      return byProduct ?? [];
    },
  });

  const enriched = snapshotItems.map((s: any) => {
    if (s.product) return s;
    const live = (liveSkus ?? []).find((x: any) => x.id === s.sku_id || x.product_id === s.sku_id);
    return {
      ...s,
      size_ml: s.size_ml ?? live?.size_ml,
      product: live?.product ?? null,
    };
  });
  const itemsToRender = snapshotComplete
    ? enriched
    : (liveItems && liveItems.length > 0 ? liveItems : enriched);

  if (liveLoading && itemsToRender.length === 0) {
    return (
      <div className="pl-4 border-l-2 text-sm text-muted-foreground">Loading contents…</div>
    );
  }

  if (itemsToRender.length === 0) {
    return (
      <div className="pl-4 border-l-2 text-sm text-muted-foreground italic">
        No items found in snapshot and no live config to fall back to.
      </div>
    );
  }

  return (
    <div className="pl-4 border-l-2 space-y-2">
      {itemsToRender.map((bundleItem: any, idx: number) => (
        <div key={idx} className="flex items-center gap-2 text-sm">
          <Badge variant="outline" className="text-xs">Slot {bundleItem.slot_index + 1}</Badge>
          {bundleItem.product ? (
            <>
              <span className="font-medium">{bundleItem.product.name}</span>
              <span className="text-muted-foreground">by {bundleItem.product.brand}</span>
              {bundleItem.size_ml && (
                <span className="text-muted-foreground">({bundleItem.size_ml}ml)</span>
              )}
            </>
          ) : (
            <span className="text-muted-foreground italic">
              Product info unavailable
              {bundleItem.sku_id ? ` (id: ${bundleItem.sku_id.substring(0, 8)}…)` : ''}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

const OrderDetails = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [isEditingShipping, setIsEditingShipping] = useState(false);

  // Fetch order with items
  const { data: order, isLoading } = useQuery({
    queryKey: ['admin-order', orderId],
    queryFn: async () => {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (itemsError) throw itemsError;

      return {
        ...orderData,
        items: itemsData
      } as OrderWithItems;
    },
    enabled: !!orderId
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const { data, error, count } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select();
      if (error) {
        // Surface RLS / constraint / network errors with full context
        console.error('Order status update failed:', error);
        throw new Error(`${error.message}${error.details ? `: ${error.details}` : ''}${error.hint ? ` (${error.hint})` : ''}`);
      }
      if (!data || data.length === 0) {
        // No rows updated: typically a silent RLS rejection on UPDATE.
        throw new Error(
          'Update returned 0 rows. This usually means RLS rejected the UPDATE. ' +
          'Verify the current user is in admin_users (run `SELECT is_admin();` in SQL Editor).'
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-order', orderId] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast({
        title: "Status Updated",
        description: "Order status has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update order status",
        variant: "destructive",
      });
    }
  });

  // Update shipping cost mutation
  const updateShippingMutation = useMutation({
    mutationFn: async (newShipping: number) => {
      const newTotal = (order?.subtotal_bani || 0) + newShipping;
      const { data, error } = await supabase
        .from('orders')
        .update({
          shipping_bani: newShipping,
          total_bani: newTotal,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select();
      if (error) {
        console.error('Order shipping update failed:', error);
        throw new Error(`${error.message}${error.details ? `: ${error.details}` : ''}${error.hint ? ` (${error.hint})` : ''}`);
      }
      if (!data || data.length === 0) {
        throw new Error(
          'Update returned 0 rows. RLS likely rejected the UPDATE. ' +
          'Check `SELECT is_admin();` in SQL Editor.'
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-order', orderId] });
      setIsEditingShipping(false);
      toast({
        title: "Shipping Updated",
        description: "Shipping cost has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update shipping cost",
        variant: "destructive",
      });
    }
  });

  // Calculate items total for integrity check
  const calculatedItemsTotal = order?.items.reduce((sum, item) => sum + item.line_total_bani, 0) || 0;
  const hasIntegrityIssue = order && Math.abs(order.subtotal_bani - calculatedItemsTotal) > 1; // Allow 1 bani difference for rounding

  // Render item based on type
  const renderOrderItem = (item: any) => {
    const snapshot = item.snapshot as OrderItemSnapshot | null;
    
    // Debug: Log snapshot structure for troubleshooting
    if (item.item_type === 'custom_bundle' && snapshot) {
      console.log('Custom bundle snapshot:', JSON.stringify(snapshot, null, 2));
    }

    if (item.item_type === 'sku') {
      return (
        <div className="flex items-center gap-4 p-4 border rounded-lg">
          <div className="flex-1">
            <div className="font-semibold">{snapshot?.product_name || 'Product'}</div>
            <div className="text-sm text-muted-foreground">
              {snapshot?.brand} • {snapshot?.size_ml}ml • {snapshot?.size_label}
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium">{formatPrice(item.unit_price_bani)} × {item.quantity}</div>
            <div className="text-sm text-muted-foreground">= {formatPrice(item.line_total_bani)}</div>
          </div>
        </div>
      );
    }

    if (item.item_type === 'predefined_bundle' || item.item_type === 'custom_bundle') {
      return (
        <div className="p-4 border rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold flex items-center gap-2">
                {snapshot?.config?.name || 'Bundle'}
                {item.item_type === 'custom_bundle' && (
                  <Badge variant="secondary" className="text-xs">Custom</Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {snapshot?.config?.total_slots} slots × {snapshot?.config?.volume_ml}ml
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium">{formatPrice(item.unit_price_bani)} × {item.quantity}</div>
              <div className="text-sm text-muted-foreground">= {formatPrice(item.line_total_bani)}</div>
            </div>
          </div>
          
          <BundleContents item={item} snapshot={snapshot} />
        </div>
      );
    }

    return null;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Loading order details...</div>
        </CardContent>
      </Card>
    );
  }

  if (!order) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">Order not found</div>
        </CardContent>
      </Card>
    );
  }

  const shippingAddress = order.shipping_address as any;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/admin?tab=orders')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
        <h1 className="text-2xl font-bold">Order {order.id.substring(0, 8)}...</h1>
      </div>

      {/* Integrity Warning */}
      {hasIntegrityIssue && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Data integrity warning: Subtotal ({formatPrice(order.subtotal_bani)}) does not match sum of items ({formatPrice(calculatedItemsTotal)})
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer & Shipping */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer & Shipping
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <div className="font-medium">{order.customer_name || 'N/A'}</div>
                </div>
                <div>
                  <Label>Phone</Label>
                  <div className="font-medium">{order.customer_phone || 'N/A'}</div>
                </div>
                <div className="col-span-2">
                  <Label>Email</Label>
                  <div className="font-medium">{order.customer_email || 'N/A'}</div>
                </div>
              </div>

              <Separator />

              <div>
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Shipping Address
                </Label>
                {shippingAddress ? (
                  <div className="mt-2 p-3 bg-muted rounded-lg">
                    <div className="font-medium">{shippingAddress.firstName} {shippingAddress.lastName}</div>
                    <div>{shippingAddress.address}</div>
                    <div>{shippingAddress.city}{shippingAddress.postalCode ? `, ${shippingAddress.postalCode}` : ''}</div>
                    <div>{shippingAddress.country}</div>
                    <div className="text-sm text-muted-foreground mt-1">Phone: {shippingAddress.phone}</div>
                  </div>
                ) : (
                  <div className="text-muted-foreground">No address provided</div>
                )}
              </div>

              <Separator />

              <div>
                <Label>Shipping Cost</Label>
                {isEditingShipping ? (
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="number"
                      value={shippingCost !== null ? shippingCost / 100 : order.shipping_bani / 100}
                      onChange={(e) => setShippingCost(Math.round(parseFloat(e.target.value) * 100))}
                      step="0.01"
                    />
                    <Button
                      size="sm"
                      onClick={() => {
                        if (shippingCost !== null) {
                          updateShippingMutation.mutate(shippingCost);
                        }
                      }}
                      disabled={updateShippingMutation.isPending}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setIsEditingShipping(false);
                        setShippingCost(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="font-medium">{formatPrice(order.shipping_bani)}</div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setShippingCost(order.shipping_bani);
                        setIsEditingShipping(true);
                      }}
                    >
                      Edit
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Items Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Items ({order.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id}>
                  {renderOrderItem(item)}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Totals & Actions */}
        <div className="space-y-6">
          {/* Totals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Totals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-medium">{formatPrice(order.subtotal_bani)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span className="font-medium">{formatPrice(order.shipping_bani)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{formatPrice(order.total_bani)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Status & Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Status & Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Current Status</Label>
                <Select
                  value={order.status}
                  onValueChange={(value) => updateStatusMutation.mutate(value)}
                  disabled={updateStatusMutation.isPending}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="placed">Placed</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div className="space-y-2">
                <Button
                  className="w-full"
                  variant={order.status === 'paid' ? 'default' : 'outline'}
                  onClick={() => updateStatusMutation.mutate('paid')}
                  disabled={updateStatusMutation.isPending}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Mark as Paid
                </Button>
                <Button
                  className="w-full"
                  variant={order.status === 'shipped' ? 'default' : 'outline'}
                  onClick={() => updateStatusMutation.mutate('shipped')}
                  disabled={updateStatusMutation.isPending}
                >
                  Mark as Shipped
                </Button>
                <Button
                  className="w-full"
                  variant={order.status === 'delivered' ? 'default' : 'outline'}
                  onClick={() => updateStatusMutation.mutate('delivered')}
                  disabled={updateStatusMutation.isPending}
                >
                  Mark as Delivered
                </Button>
                <Button
                  className="w-full"
                  variant="destructive"
                  onClick={() => {
                    if (confirm('Are you sure you want to cancel this order?')) {
                      updateStatusMutation.mutate('canceled');
                    }
                  }}
                  disabled={updateStatusMutation.isPending}
                >
                  Cancel Order
                </Button>
              </div>

              <div className="pt-4 border-t text-sm text-muted-foreground space-y-1">
                <div>Created: {new Date(order.created_at).toLocaleString()}</div>
                <div>Updated: {new Date(order.updated_at).toLocaleString()}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;

