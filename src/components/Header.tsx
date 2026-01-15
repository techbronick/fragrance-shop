import { Search, ShoppingBag, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useRef, useEffect } from "react";
import { useCart } from "@/hooks/useCart";
import { useNavigate, Link } from "react-router-dom";
import { useProducts } from "@/hooks/useProducts";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { items, removeItem, clearCart } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { data: products } = useProducts();

  // Filtered recommendations
  const recommendations = (searchTerm && products)
    ? products.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5)
    : [];

  // Close cart dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (cartRef.current && !cartRef.current.contains(event.target as Node)) {
        setCartOpen(false);
      }
    }
    if (cartOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [cartOpen]);

  // Close search on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    }
    if (searchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchOpen]);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchOpen(false);
      setIsMenuOpen(false); // Close mobile menu
      setSearchTerm("");
    }
  };

  // Handle search input key press
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    } else if (e.key === 'Escape') {
      setSearchOpen(false);
      setSearchTerm("");
    }
  };

  const goCheckout = () => {
    setCartOpen(false);
    setIsMenuOpen(false);
    setSearchOpen(false);
    navigate("/checkout");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border" style={{ background: '#ededed' }}>
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center justify-center">
              <img
                src="/logo.png"
                alt="Scent Discovery Vault Logo"
                className="h-14 w-[180px] object-contain"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
              Acasă
            </Link>
            <Link to="/shop" className="text-sm font-medium hover:text-primary transition-colors">
              Magazin
            </Link>
            <Link to="/discovery-sets" className="text-sm font-medium hover:text-primary transition-colors">
              Seturi Discovery
            </Link>
            <Link to="/about" className="text-sm font-medium hover:text-primary transition-colors">
              Despre
            </Link>
            <Link to="/blog" className="text-sm font-medium hover:text-primary transition-colors">
              Jurnal
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4 relative">
            {/* Search */}
            <div className="relative" ref={searchRef}>
              <Button
                variant="ghost"
                size="icon"
                className="flex"
                onClick={() => setSearchOpen(!searchOpen)}
              >
                <Search className="h-4 w-4" />
              </Button>

              {/* Search Dropdown */}
              {searchOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 top-12 w-80 max-w-[90vw] bg-background border border-border rounded-lg shadow-lg z-50 animate-fade-in">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-sm">Caută parfumuri</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setSearchOpen(false)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <form onSubmit={handleSearch}>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Caută după nume sau brand..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onKeyDown={handleSearchKeyPress}
                          className="pl-10"
                          autoFocus
                        />
                      </div>
                      {/* Recommendations */}
                      {recommendations.length > 0 && (
                        <ul className="mt-2 border rounded bg-background max-h-56 overflow-y-auto shadow-sm">
                          {recommendations.map((p) => (
                            <li
                              key={p.id}
                              className="px-3 py-2 cursor-pointer hover:bg-accent/30 text-sm flex items-center gap-3"
                              onMouseDown={() => {
                                navigate(`/product/${p.id}`);
                                setSearchOpen(false);
                                setSearchTerm("");
                              }}
                            >
                              {p.image_url && (
                                <img 
                                  src={p.image_url} 
                                  alt={`${p.brand} ${p.name}`}
                                  className="w-12 h-12 object-cover rounded flex-shrink-0"
                                  onError={(e) => {
                                    e.currentTarget.src = "/placeholder.svg";
                                  }}
                                />
                              )}
                              <span className="flex-1 min-w-0">
                                <b>{p.brand}</b> - {highlightMatch(p.name, searchTerm)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                      {/* End Recommendations */}
                      {recommendations.length > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full mt-2"
                          onMouseDown={() => {
                            navigate(`/shop?search=${encodeURIComponent(searchTerm)}`);
                            setSearchOpen(false);
                            setSearchTerm("");
                          }}
                        >
                          Vezi toate
                        </Button>
                      )}
                      <div className="mt-3 flex gap-2">
                        <Button type="submit" size="sm" className="flex-1" disabled={!searchTerm.trim()}>
                          Caută
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSearchOpen(false);
                            setSearchTerm("");
                          }}
                        >
                          Anulează
                        </Button>
                      </div>
                    </form>
                    <div className="mt-3 text-xs text-muted-foreground">
                      💡 Apasă Enter pentru căutare sau Escape pentru închidere
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={() => setCartOpen((open) => !open)}
                aria-label="Deschide coșul"
              >
                <ShoppingBag className="h-4 w-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
              {cartOpen && (
                <div
                  ref={cartRef}
                  className="absolute right-0 top-12 w-80 max-w-[90vw] bg-background border border-border rounded-lg shadow-lg z-50 animate-fade-in"
                >
                  <div className="p-4 border-b font-semibold text-lg">Coșul tău</div>
                  <div className="p-4 space-y-4 max-h-72 overflow-y-auto">
                    {items.length === 0 ? (
                      <div className="text-center text-muted-foreground">Coșul este gol.</div>
                    ) : (
                      items.map((item) => (
                        <div key={item.id + (item.skuId || '')} className="flex items-center gap-3 border-b pb-2">
                          {item.image && (
                            <img src={item.image} alt={item.name} className="w-10 h-10 object-cover rounded" />
                          )}
                          <div className="flex-1">
                            <div className="font-medium text-sm">{item.name}</div>
                            {item.brand && <div className="text-xs text-muted-foreground">{item.brand}</div>}
                            {item.sizeLabel && <div className="text-xs">{item.sizeLabel}</div>}
                            <div className="text-xs">Cantitate: {item.quantity}</div>
                            <div className="text-xs font-semibold">{item.price} Lei</div>
                          </div>
                          <Button size="icon" variant="ghost" onClick={() => removeItem(item.id, item.skuId)}>
                            ✕
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-4 border-t flex gap-2">
                    <Button variant="outline" onClick={clearCart} disabled={items.length === 0} className="flex-1">
                      Golește Coșul
                    </Button>
                    <Button disabled={items.length === 0} onClick={goCheckout} className="flex-1">
                      Continuă către Plată
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-border pt-4">
            <div className="flex flex-col items-center space-y-4">
              {/* Mobile Search */}
              <div className="pb-4 border-b border-border">
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Caută parfumuri..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={handleSearchKeyPress}
                      className="pl-10"
                    />
                  </div>
                  <Button type="submit" size="sm" className="w-full mt-2" disabled={!searchTerm.trim()}>
                    Caută
                  </Button>
                </form>
              </div>

              <Link to="/" className="text-sm font-medium hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
                Acasă
              </Link>
              <Link to="/shop" className="text-sm font-medium hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
                Magazin
              </Link>
              <Link to="/discovery-sets" className="text-sm font-medium hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
                Seturi Discovery
              </Link>
              <Link to="/about" className="text-sm font-medium hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
                Despre
              </Link>
              <Link to="/blog" className="text-sm font-medium hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
                Jurnal
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;

// Helper to highlight match
function highlightMatch(text: string, term: string) {
  if (!term) return text;
  const idx = text.toLowerCase().indexOf(term.toLowerCase());
  if (idx === -1) return text;
  return <>{text.slice(0, idx)}<b>{text.slice(idx, idx + term.length)}</b>{text.slice(idx + term.length)}</>;
}
