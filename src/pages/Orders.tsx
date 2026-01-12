import { useOrders } from "@/hooks/useOrders";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCheckoutPrice } from "@/utils/formatCheckoutPrice";

const Orders = () => {
  const navigate = useNavigate();
  // TODO: Get actual user_id from auth context
  const userId = "temp-user-id"; // Replace with actual auth
  const { data: orders, isLoading } = useOrders(userId);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'default';
      case 'cancelled':
        return 'destructive';
      case 'processing':
      case 'shipped':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Comenzile Mele</h1>

        {isLoading ? (
          <div>Se încarcă...</div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">
                        Comanda #{order.id.slice(0, 8)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('ro-RO', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(order.status)}>
                      {order.status}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-xl font-bold">
                        {formatCheckoutPrice(order.total_bani)}
                      </p>
                    </div>
                    <Button onClick={() => navigate(`/orders/${order.id}`)}>
                      Vezi Detalii
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Nu ai comenzi încă</p>
            <Button onClick={() => navigate('/shop')}>
              Începe Cumpărăturile
            </Button>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Orders;