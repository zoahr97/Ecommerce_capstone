import { useEffect, useState } from 'react';

import {
  Routes,
  Route,
  Navigate,
  useLocation
} from 'react-router-dom';

import toast, {
  Toaster
} from 'react-hot-toast';

import socket from './services/socket';

// Components
import Navbar from './components/Navbar';
import ProductGrid from './components/ProductGrid';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import FloatingAssistantButton from './components/FloatingAssistantButton';
import AccessibilityMenu from './components/AccessibilityMenu';

// Pages
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';
import Register from './pages/Register';
import MyOrders from './pages/MyOrders';
import OrderSuccess from './pages/OrderSuccess';
import AIAssistant from './pages/AIAssistant';
import Contact from './pages/Contact';

function App() {
  const location = useLocation();

  const [items, setItems] = useState([]);

  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem(
      'baking_corner_cart'
    );

    if (!savedCart) {
      return [];
    }

    try {
      return JSON.parse(savedCart);
    } catch (error) {
      console.error(
        'Invalid saved cart:',
        error
      );

      return [];
    }
  });

  const [
    currentUser,
    setCurrentUser
  ] = useState(() => {
    const savedUser = localStorage.getItem(
      'baking_corner_user'
    );

    if (!savedUser) {
      return null;
    }

    try {
      return JSON.parse(savedUser);
    } catch (error) {
      console.error(
        'Invalid saved user:',
        error
      );

      localStorage.removeItem(
        'baking_corner_user'
      );

      localStorage.removeItem(
        'baking_corner_token'
      );

      return null;
    }
  });

  const loadProducts = async () => {
    try {
      const response = await fetch(
        'http://localhost:5000/api/products'
      );

      if (!response.ok) {
        throw new Error(
          'Failed to load products'
        );
      }

      const data = await response.json();

      setItems(data);
    } catch (error) {
      console.error(
        'Error fetching products:',
        error
      );

      toast.error(
        'Failed to load products',
        {
          id: 'load-products-error'
        }
      );
    }
  };

  useEffect(() => {
    const handleSocketConnect = () => {
      console.log(
        'Connected to real-time server'
      );
    };

    const handleProductsChanged = () => {
      loadProducts();
    };

    socket.on(
      'connect',
      handleSocketConnect
    );

    socket.on(
      'products:changed',
      handleProductsChanged
    );

    return () => {
      socket.off(
        'connect',
        handleSocketConnect
      );

      socket.off(
        'products:changed',
        handleProductsChanged
      );
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(
      'baking_corner_cart',
      JSON.stringify(cart)
    );
  }, [cart]);

  useEffect(() => {
    const productPages = [
      '/',
      '/ingredients',
      '/equipment'
    ];

    if (
      productPages.includes(
        location.pathname
      )
    ) {
      loadProducts();
    }
  }, [location.pathname]);

  const addToCart = async (product) => {
    try {
      const response = await fetch(
        'http://localhost:5000/api/products'
      );

      if (!response.ok) {
        throw new Error(
          'Failed to check inventory'
        );
      }

      const latestProducts =
        await response.json();

      const latestProduct =
        latestProducts.find(
          (item) =>
            Number(item.id) ===
            Number(product.id)
        );

      if (!latestProduct) {
        toast.error(
          'Product was not found',
          {
            id:
              `product-not-found-${product.id}`
          }
        );

        return;
      }

      const availableStock =
        Number(latestProduct.stock);

      if (availableStock <= 0) {
        toast.error(
          `"${latestProduct.name}" is out of stock`,
          {
            id:
              `out-of-stock-${latestProduct.id}`
          }
        );

        setItems(latestProducts);
        return;
      }

      setItems(latestProducts);

      setCart((previousCart) => {
        const existingItem =
          previousCart.find(
            (item) =>
              Number(item.id) ===
              Number(latestProduct.id)
          );

        const currentQuantity =
          existingItem
            ? Number(existingItem.quantity)
            : 0;

        if (
          currentQuantity >=
          availableStock
        ) {
          const unitText =
            availableStock === 1
              ? 'unit'
              : 'units';

          const verb =
            availableStock === 1
              ? 'is'
              : 'are';

          toast.error(
            `Only ${availableStock} ${unitText} of "${latestProduct.name}" ${verb} available`,
            {
              id:
                `stock-limit-${latestProduct.id}`
            }
          );

          return previousCart;
        }

        toast.success(
          `"${latestProduct.name}" added to cart`,
          {
            id:
              `add-product-${latestProduct.id}`
          }
        );

        if (existingItem) {
          return previousCart.map(
            (item) =>
              Number(item.id) ===
              Number(latestProduct.id)
                ? {
                    ...item,
                    stock: availableStock,
                    quantity:
                      currentQuantity + 1
                  }
                : item
          );
        }

        return [
          ...previousCart,
          {
            ...latestProduct,
            stock: availableStock,
            quantity: 1
          }
        ];
      });
    } catch (error) {
      console.error(
        'Inventory check failed:',
        error
      );

      toast.error(
        'Could not check the current inventory',
        {
          id: 'inventory-check-error'
        }
      );
    }
  };

  const addRecipeProductsToCart = async (
    selectedProducts
  ) => {
    try {
      const response = await fetch(
        'http://localhost:5000/api/products'
      );

      if (!response.ok) {
        throw new Error(
          'Failed to check inventory'
        );
      }

      const latestProducts =
        await response.json();

      setItems(latestProducts);

      setCart((previousCart) => {
        const updatedCart =
          previousCart.map((item) => ({
            ...item
          }));

        let addedUnits = 0;

        selectedProducts.forEach(
          (selection) => {
            const latestProduct =
              latestProducts.find(
                (product) =>
                  Number(product.id) ===
                  Number(selection.id)
              );

            if (!latestProduct) {
              return;
            }

            const availableStock =
              Number(latestProduct.stock);

            const requestedQuantity =
              Number(selection.quantity);

            if (
              availableStock <= 0 ||
              !Number.isInteger(
                requestedQuantity
              ) ||
              requestedQuantity <= 0
            ) {
              return;
            }

            const existingIndex =
              updatedCart.findIndex(
                (item) =>
                  Number(item.id) ===
                  Number(latestProduct.id)
              );

            const currentQuantity =
              existingIndex >= 0
                ? Number(
                    updatedCart[
                      existingIndex
                    ].quantity
                  )
                : 0;

            const remainingStock = Math.max(
              0,
              availableStock - currentQuantity
            );

            const quantityToAdd = Math.min(
              requestedQuantity,
              remainingStock
            );

            if (quantityToAdd <= 0) {
              return;
            }

            if (existingIndex >= 0) {
              updatedCart[existingIndex] = {
                ...updatedCart[existingIndex],
                ...latestProduct,
                stock: availableStock,
                quantity:
                  currentQuantity + quantityToAdd
              };
            } else {
              updatedCart.push({
                ...latestProduct,
                stock: availableStock,
                quantity: quantityToAdd
              });
            }

            addedUnits += quantityToAdd;
          }
        );

        if (addedUnits === 0) {
          toast.error(
            'The recipe products are already in your cart or unavailable',
            {
              id: 'recipe-products-unavailable'
            }
          );

          return previousCart;
        }

        toast.success(
          `${addedUnits} recipe items added to your cart`,
          {
            id: 'recipe-products-added'
          }
        );

        return updatedCart;
      });
    } catch (error) {
      console.error(
        'Adding recipe products failed:',
        error
      );

      toast.error(
        'Could not check the current inventory',
        {
          id: 'recipe-inventory-error'
        }
      );

      throw error;
    }
  };

  const decreaseQuantity = (product) => {
    setCart((previousCart) => {
      const existingItem =
        previousCart.find(
          (item) =>
            Number(item.id) ===
            Number(product.id)
        );

      if (!existingItem) {
        return previousCart;
      }

      if (
        Number(existingItem.quantity) === 1
      ) {
        return previousCart.filter(
          (item) =>
            Number(item.id) !==
            Number(product.id)
        );
      }

      return previousCart.map(
        (item) =>
          Number(item.id) ===
          Number(product.id)
            ? {
                ...item,
                quantity:
                  Number(item.quantity) - 1
              }
            : item
      );
    });
  };

  const removeFromCart = (productId) => {
    setCart((previousCart) =>
      previousCart.filter(
        (item) =>
          Number(item.id) !==
          Number(productId)
      )
    );
  };

  const clearCart = () => {
    setCart([]);

    localStorage.removeItem(
      'baking_corner_cart'
    );

    loadProducts();
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem(
      'baking_corner_token'
    );

    localStorage.removeItem(
      'baking_corner_user'
    );

    setCurrentUser(null);

    toast.success(
      'Logged out successfully',
      {
        id: 'logout-success'
      }
    );
  };

  const totalItemsInCart = cart.reduce(
    (sum, item) =>
      sum + Number(item.quantity),
    0
  );

  return (
    <div
      style={{
        padding: '40px 20px',
        maxWidth: '1200px',
        margin: '0 auto',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Toaster />

      <AccessibilityMenu />

      <Navbar
        currentUser={currentUser}
        totalItemsInCart={totalItemsInCart}
        onLogout={handleLogout}
      />

      {currentUser && (
        <FloatingAssistantButton />
      )}

      <Routes>
        <Route
          path="/"
          element={
            <ProductGrid
              products={items}
              onAddToCart={addToCart}
              cart={cart}
            />
          }
        />

        <Route
          path="/ingredients"
          element={
            <ProductGrid
              products={items.filter(
                (item) =>
                  item.category ===
                  'ingredients'
              )}
              onAddToCart={addToCart}
              cart={cart}
            />
          }
        />

        <Route
          path="/equipment"
          element={
            <ProductGrid
              products={items.filter(
                (item) =>
                  item.category ===
                  'equipment'
              )}
              onAddToCart={addToCart}
              cart={cart}
            />
          }
        />
        <Route
  path="/contact"
  element={<Contact />}
/>

        <Route
          path="/login"
          element={
            currentUser ? (
              <Navigate to="/" replace />
            ) : (
              <Login onLogin={handleLogin} />
            )
          }
        />

        <Route
          path="/ai-assistant"
          element={
            currentUser ? (
              <AIAssistant
                onAddProductsToCart={
                  addRecipeProductsToCart
                }
              />
            ) : (
              <Navigate
                to="/login"
                replace
              />
            )
          }
        />

        <Route
          path="/register"
          element={
            currentUser ? (
              <Navigate to="/" replace />
            ) : (
              <Register />
            )
          }
        />

        <Route
          path="/my-orders"
          element={
            <ProtectedRoute
              currentUser={currentUser}
            >
              <MyOrders
                onProductsChanged={loadProducts}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute
              currentUser={currentUser}
            >
              <AdminPanel
                onProductsChanged={loadProducts}
              />
            </AdminRoute>
          }
        />

        <Route
          path="/cart"
          element={
            <Cart
              cart={cart}
              onIncrease={addToCart}
              onDecrease={decreaseQuantity}
              onRemove={removeFromCart}
            />
          }
        />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute
              currentUser={currentUser}
            >
              <Checkout
                cart={cart}
                currentUser={currentUser}
                onOrderComplete={clearCart}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="/order-success"
          element={
            <ProtectedRoute
              currentUser={currentUser}
            >
              <OrderSuccess />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={
            <Navigate to="/" replace />
          }
        />
      </Routes>
    </div>
  );
}

export default App;