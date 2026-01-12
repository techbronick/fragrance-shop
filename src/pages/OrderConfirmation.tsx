import { useParams, useNavigate } from "react-router-dom";
import { useOrder } from "@/hooks/useOrders";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Package, Mail, Phone } from "lucide-react";
import { formatCheckoutPrice } from "@/utils/formatCheckoutPrice";

const OrderConfirmation = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { data: order, isLoading, error } = useOrder(orderId!);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse">Se încarcă comanda...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Comandă negăsită</h1>
            <Button onClick={() => navigate('/shop')}>
              Înapoi la Magazine
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        {/* Success Header */}
        <div className="text-center mb-8">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold mb-2">Comandă Confirmată!</h1>
          <p className="text-muted-foreground">
            Comanda #{order.id.slice(0, 8)} a fost plasată cu succes
          </p>
        </div>

        {/* Order Details */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Detalii Comandă
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-sm text-muted-foreground">Status:</span>
                <p className="font-medium capitalize">{order.status}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Data:</span>
                <p className="font-medium">
                  {new Date(order.created_at).toLocaleDateString('ro-RO')}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Informații Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <span className="text-sm text-muted-foreground">Email:</span>
                <p className="font-medium">{order.customer_email}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Telefon:</span>
                <p className="font-medium">{order.customer_phone}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Items */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Produse Comandate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 border-b pb-4 last:border-0">
                  {item.snapshot?.image_url && (
                    <img 
                      src={item.snapshot.image_url} 
                      alt={item.snapshot.product_name || ''} 
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium">{item.snapshot?.product_name}</h3>
                    {item.snapshot?.brand && (
                      <p className="text-sm text-muted-foreground">{item.snapshot.brand}</p>
                    )}
                    {item.snapshot?.size_label && (
                      <p className="text-sm">{item.snapshot.size_label}</p>
                    )}
                    <p className="text-sm">Cantitate: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCheckoutPrice(item.line_total_bani)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 pt-6 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>{formatCheckoutPrice(order.subtotal_bani)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Livrare:</span>
                <span>{formatCheckoutPrice(order.shipping_bani)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>{formatCheckoutPrice(order.total_bani)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Shipping Address */}
        {order.shipping_address && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Adresă de Livrare</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{order.customer_name}</p>
              <p>{order.shipping_address.address}</p>
              <p>{order.shipping_address.city}, {order.shipping_address.postalCode}</p>
              <p>{order.shipping_address.country}</p>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={() => navigate('/shop')}>
            Continuă Cumpărăturile
          </Button>
          <Button onClick={() => navigate(`/orders`)}>
            Vezi Toate Comenzile
          </Button>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default OrderConfirmation;