"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useSession } from "next-auth/react";
import { IconLoader2 } from "@tabler/icons-react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const categories = Array.from({ length: 20 }, (_, i) => `Category ${i + 1}`);
const products = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  name: `Product ${i + 1}`,
  price: parseFloat((Math.random() * 20 + 1).toFixed(2)),
  category: categories[i % categories.length],
  image: "/placeholder.png",
}));

export default function POS() {
  const [cartVisible, setCartVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(5);
  const [taxRate, setTaxRate] = useState(0.1);

  const { status } = useSession();

  if (status === "loading")
    return (
      <IconLoader2 className="size-10 animate-spin mx-auto h-screen text-gray-500" />
    );

  if (status === "unauthenticated") {
    redirect("/login");
  }

  const filteredProducts = products.filter(
    (p) =>
      (selectedCategory === "All" || p.category === selectedCategory) &&
      p.name.toLowerCase().includes(search.toLowerCase())
  );

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, qty) => {
    if (qty < 1) {
      return removeFromCart(id);
    }

    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: qty } : item))
    );
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );
  const tax = (subtotal - discount) * taxRate;
  const total = subtotal - discount + tax;

  return (
    <div className="flex flex-col md:flex-row h-screen relative bg-background text-foreground">
      {/* Cart Toggle Button for small screens */}
      <Button
        onClick={() => setCartVisible(true)}
        className="md:hidden fixed bottom-4 right-4 z-50"
      >
        View Cart
      </Button>

      {/* Main Content */}
      <div className="flex-1 p-4 pt-0 overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background z-20 pb-2 mb-2 pt-2">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-xl font-bold">Point of Sale</h1>
            <div className="flex items-center gap-2">
              <Link href="/dashboard">
                <Button size="icon" variant="ghost">
                  <X className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-2 w-full"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto sticky top-[6.5rem] bg-background py-2 z-10">
          {["All", ...categories].map((cat) => (
            <Button
              key={cat}
              variant={cat === selectedCategory ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat)}
              className="whitespace-nowrap"
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {filteredProducts.map((product, index) => (
            <Card
              key={index}
              onClick={() => addToCart(product)}
              className="w-full cursor-pointer overflow-hidden rounded-lg border border-primary shadow-sm p-0 hover:opacity-80"
            >
              <img
                src="/product.png"
                alt="Product Image"
                width={600}
                height={400}
                className="h-48 w-full object-cover"
                style={{ aspectRatio: "600/400", objectFit: "cover" }}
              />
              <CardContent className="p-4 pt-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold">{product.name}</h3>
                  <span className="text-2xl font-bold text-primary">
                    ${product.price}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Cart Sidebar */}
      <div
        className={`
          fixed md:static top-0 right-0 h-full w-80 bg-muted border-l p-4 overflow-auto z-40
          ${cartVisible ? "block" : "hidden"} md:block
        `}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Cart</h2>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setCartVisible(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {cart.length === 0 && (
          <p className="text-muted-foreground">Cart is empty</p>
        )}

        {cart.map((item) => (
          <div key={item.id} className="py-2 border-b">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{item.name}</div>
                <div className="text-sm text-muted-foreground">
                  ${item.price.toFixed(2)} x {item.quantity}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    -
                  </Button>
                  <span className="px-1">{item.quantity}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>
            <div className="text-right mt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFromCart(item.id)}
                className="text-red-600"
              >
                Remove
              </Button>
            </div>
          </div>
        ))}

        {cart.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between text-sm mb-1">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span>Discount:</span>
              <span>
                <Input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                  className="w-20 text-right h-7 px-1"
                />
              </span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span>Tax (%):</span>
              <span>
                <Input
                  type="number"
                  value={taxRate * 100}
                  onChange={(e) =>
                    setTaxRate((parseFloat(e.target.value) || 0) / 100)
                  }
                  className="w-20 text-right h-7 px-1"
                />
              </span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <Button className="w-full mt-4">Checkout</Button>
          </div>
        )}
      </div>
    </div>
  );
}
