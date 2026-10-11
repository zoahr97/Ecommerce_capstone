import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import socket from '../services/socket';
import ContactMessages from '../components/ContactMessages';
import CouponsPanel from '../components/CouponsPanel';
const emptyProductForm = {
  name: '',
  description: '',
  price: '',
  category: 'ingredients',
  image_url: '',
  stock: ''
};

const getToken = () =>
  localStorage.getItem('baking_corner_token');

const getAuthHeaders = (includeContentType = false) => {
  const headers = {
    Authorization: `Bearer ${getToken()}`
  };

  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }

  return headers;
};

export default function AdminPanel({
  onProductsChanged
}) {
  const [activeTab, setActiveTab] =
    useState('orders');

  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] =
    useState([]);

  const [form, setForm] =
    useState(emptyProductForm);

  const [
    editingProductId,
    setEditingProductId
  ] = useState(null);

  const [
    selectedOrder,
    setSelectedOrder
  ] = useState(null);

  const [orderItems, setOrderItems] =
    useState([]);

  const [
    selectedImage,
    setSelectedImage
  ] = useState(null);

  const [
    isUploadingImage,
    setIsUploadingImage
  ] = useState(false);

  const fetchData = async () => {
    try {
      const [
        ordersResponse,
        usersResponse,
        productsResponse
      ] = await Promise.all([
        fetch(
          'http://localhost:5000/api/orders',
          {
            headers: getAuthHeaders()
          }
        ),

        fetch(
          'http://localhost:5000/api/users',
          {
            headers: getAuthHeaders()
          }
        ),

        fetch(
          'http://localhost:5000/api/products'
        )
      ]);

      if (
        ordersResponse.status === 401 ||
        usersResponse.status === 401
      ) {
        throw new Error(
          'Your session expired. Please log in again.'
        );
      }

      if (
        ordersResponse.status === 403 ||
        usersResponse.status === 403
      ) {
        throw new Error(
          'Administrator access is required'
        );
      }

      if (!ordersResponse.ok) {
        throw new Error(
          'Failed to load orders'
        );
      }

      if (!usersResponse.ok) {
        throw new Error(
          'Failed to load users'
        );
      }

      if (!productsResponse.ok) {
        throw new Error(
          'Failed to load products'
        );
      }

      const [
        ordersData,
        usersData,
        productsData
      ] = await Promise.all([
        ordersResponse.json(),
        usersResponse.json(),
        productsResponse.json()
      ]);

      setOrders(ordersData);
      setUsers(usersData);
      setProducts(productsData);
    } catch (error) {
      console.error(
        'Error fetching admin data:',
        error
      );

      toast.error(error.message, {
        id: 'admin-data-error'
      });
    }
  };

  useEffect(() => {
  const handleOrdersChanged = () => {
    fetchData();
  };

  const handleProductsChanged = () => {
    fetchData();
  };

  fetchData();

  socket.on(
    'orders:changed',
    handleOrdersChanged
  );

  socket.on(
    'products:changed',
    handleProductsChanged
  );

  return () => {
    socket.off(
      'orders:changed',
      handleOrdersChanged
    );

    socket.off(
      'products:changed',
      handleProductsChanged
    );
  };
}, []);
  const handleAddProduct = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch(
        'http://localhost:5000/api/products',
        {
          method: 'POST',
          headers: getAuthHeaders(true),
          body: JSON.stringify(form)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Failed to add product'
        );
      }

      setForm(emptyProductForm);
      setSelectedImage(null);

      await fetchData();
      await onProductsChanged?.();

      toast.success(
        'Product added successfully!',
        {
          id: 'product-added'
        }
      );
    } catch (error) {
      console.error(
        'Error adding product:',
        error
      );

      toast.error(error.message, {
        id: 'add-product-error'
      });
    }
  };

  const handleDeleteProduct = async (
    productId
  ) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this product?'
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/products/${productId}`,
        {
          method: 'DELETE',
          headers: getAuthHeaders()
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Failed to delete product'
        );
      }

      setProducts((previousProducts) =>
        previousProducts.filter(
          (product) =>
            Number(product.id) !==
            Number(productId)
        )
      );

      await onProductsChanged?.();

      toast.success(
        'Product deleted successfully!',
        {
          id: `product-deleted-${productId}`
        }
      );
    } catch (error) {
      console.error(
        'Error deleting product:',
        error
      );

      toast.error(error.message, {
        id:
          `delete-product-error-${productId}`
      });
    }
  };

  const handleUpdateProduct = async (
    productId,
    updatedData
  ) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/products/${productId}`,
        {
          method: 'PUT',
          headers: getAuthHeaders(true),
          body: JSON.stringify(updatedData)
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Failed to update product'
        );
      }

      setProducts((previousProducts) =>
        previousProducts.map((product) =>
          Number(product.id) ===
          Number(productId)
            ? {
                ...product,
                ...updatedData
              }
            : product
        )
      );

      setForm(emptyProductForm);
      setEditingProductId(null);
      setSelectedImage(null);

      await onProductsChanged?.();

      toast.success(
        'Product updated successfully!',
        {
          id: `product-updated-${productId}`
        }
      );
    } catch (error) {
      console.error(
        'Error updating product:',
        error
      );

      toast.error(error.message, {
        id:
          `update-product-error-${productId}`
      });
    }
  };

  const handleEditClick = (product) => {
    setEditingProductId(product.id);

    setForm({
      name: product.name,
      description:
        product.description || '',
      price: product.price,
      category: product.category,
      image_url: product.image_url || '',
      stock: product.stock
    });

    setSelectedImage(null);

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleViewOrder = async (order) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/orders/${order.id}/items`,
        {
          headers: getAuthHeaders()
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Failed to fetch order items'
        );
      }

      setSelectedOrder(order);
      setOrderItems(data);

      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    } catch (error) {
      console.error(
        'Error loading order details:',
        error
      );

      toast.error(error.message, {
        id:
          `order-details-error-${order.id}`
      });
    }
  };

  const handleStatusChange = async (
    orderId,
    newStatus
  ) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/orders/${orderId}/status`,
        {
          method: 'PUT',
          headers: getAuthHeaders(true),
          body: JSON.stringify({
            status: newStatus
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Failed to update status'
        );
      }

      setOrders((previousOrders) =>
        previousOrders.map((order) =>
          Number(order.id) ===
          Number(orderId)
            ? {
                ...order,
                status: newStatus
              }
            : order
        )
      );

      setSelectedOrder((previousOrder) =>
        Number(previousOrder?.id) ===
        Number(orderId)
          ? {
              ...previousOrder,
              status: newStatus
            }
          : previousOrder
      );

      const productsResponse = await fetch(
        'http://localhost:5000/api/products'
      );

      if (productsResponse.ok) {
        const updatedProducts =
          await productsResponse.json();

        setProducts(updatedProducts);
      }

      await onProductsChanged?.();

      toast.success(
        'Order status updated',
        {
          id: `status-updated-${orderId}`
        }
      );
    } catch (error) {
      console.error(
        'Error updating order status:',
        error
      );

      toast.error(error.message, {
        id: `status-error-${orderId}`
      });
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) {
      toast.error(
        'Please select an image',
        {
          id: 'select-image-error'
        }
      );

      return;
    }

    const uploadData = new FormData();

    uploadData.append(
      'image',
      selectedImage
    );

    setIsUploadingImage(true);

    try {
      const response = await fetch(
        'http://localhost:5000/api/uploads/product-image',
        {
          method: 'POST',
          headers: {
            Authorization:
              `Bearer ${getToken()}`
          },
          body: uploadData
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            'Failed to upload image'
        );
      }

      setForm((previousForm) => ({
        ...previousForm,
        image_url: data.imageUrl
      }));

      setSelectedImage(null);

      toast.success(
        'Image uploaded successfully',
        {
          id: 'image-uploaded'
        }
      );
    } catch (error) {
      console.error(
        'Image upload error:',
        error
      );

      toast.error(error.message, {
        id: 'image-upload-error'
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const totalRevenue = orders
    .filter(
      (order) =>
        String(
          order.status
        ).toLowerCase() !== 'cancelled'
    )
    .reduce(
      (sum, order) =>
        sum +
        Number(order.total_amount || 0),
      0
    );

  const pendingOrders = orders.filter(
    (order) =>
      String(
        order.status
      ).toLowerCase() === 'pending'
  ).length;

  const registeredCustomers = users.filter(
    (user) =>
      String(
        user.role
      ).toLowerCase() === 'customer'
  ).length;

  const lowStockProducts =
    products.filter(
      (product) =>
        Number(product.stock) <= 5
    ).length;

  const dashboardStats = [
    {
      label: 'Total Orders',
      value: orders.length,
      color: '#3498db'
    },
    {
      label: 'Total Revenue',
      value: `₪${totalRevenue.toFixed(2)}`,
      color: '#27ae60'
    },
    {
      label: 'Pending Orders',
      value: pendingOrders,
      color: '#f39c12'
    },
    {
      label: 'Registered Customers',
      value: registeredCustomers,
      color: '#8e44ad'
    },
    {
      label: 'Low Stock Products',
      value: lowStockProducts,
      color: '#e74c3c'
    }
  ];

  return (
    <div
      style={{
        maxWidth: '1000px',
        width: '100%',
        margin: '0 auto',
        padding: '20px',
        boxSizing: 'border-box'
      }}
    >
      <h2>
        Admin Control Panel 
      </h2>

      <section
        aria-label="Store summary"
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(165px, 1fr))',
          gap: '15px',
          margin: '20px 0 25px'
        }}
      >
        {dashboardStats.map((stat) => (
          <article
            key={stat.label}
            style={{
              backgroundColor: '#fff',
              border:
                '1px solid #e5e5e5',
              borderTop:
                `4px solid ${stat.color}`,
              padding: '18px',
              boxShadow:
                '0 3px 10px rgba(0,0,0,0.06)'
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent:
                  'space-between',
                gap: '10px'
              }}
            >
              <span
                style={{
                  color:
                    'var(--text-muted)',
                  fontSize: '0.9rem'
                }}
              >
                {stat.label}
              </span>

              <span
                aria-hidden="true"
                style={{
                  fontSize: '1.4rem'
                }}
              >
                {stat.icon}
              </span>
            </div>

            <strong
              style={{
                display: 'block',
                marginTop: '12px',
                color: stat.color,
                fontSize: '1.6rem'
              }}
            >
              {stat.value}
            </strong>
          </article>
        ))}
      </section>

      <div
        className="admin-tabs"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '15px',
          margin: '20px 0',
          borderBottom:
            '2px solid #eee',
          paddingBottom: '10px'
        }}
      >
        <button
          type="button"
          onClick={() =>
            setActiveTab('orders')
          }
          style={tabStyle(
            activeTab === 'orders'
          )}
        >
           Orders
        </button>

        <button
          type="button"
          onClick={() =>
            setActiveTab('users')
          }
          style={tabStyle(
            activeTab === 'users'
          )}
        >
           Users
        </button>

        <button
          type="button"
          onClick={() =>
            setActiveTab('products')
          }
          style={tabStyle(
            activeTab === 'products'
          )}
        >
           Products & Inventory
        </button>
        <button
  type="button"
  onClick={() =>
    setActiveTab('messages')
  }
  style={tabStyle(
    activeTab === 'messages'
  )}
>
  Contact Messages
</button>
<button
  type="button"
  onClick={() =>
    setActiveTab('coupons')
  }
  style={tabStyle(
    activeTab === 'coupons'
  )}
>
  Coupons
</button>
      </div>

      {activeTab === 'orders' && (
        <div>
          <h3>
            Customer Orders (
            {orders.length})
          </h3>

          {orders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            <div style={tableWrapperStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr
                    style={
                      tableHeaderRowStyle
                    }
                  >
                    <th style={thStyle}>
                      Order ID
                    </th>

                    <th style={thStyle}>
                      Customer
                    </th>

                    <th style={thStyle}>
                      Total
                    </th>

                    <th style={thStyle}>
                      Status
                    </th>

                    <th style={thStyle}>
                      Date
                    </th>

                    <th style={thStyle}>
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order.id}
                      style={tableRowStyle}
                    >
                      <td style={tdStyle}>
                        {order.id}
                      </td>

                      <td style={tdStyle}>
                        {order.customer_name ||
                          `User ${order.user_id}`}
                      </td>

                      <td style={tdStyle}>
                        ₪
                        {Number(
                          order.total_amount
                        ).toFixed(2)}
                      </td>

                      <td style={tdStyle}>
                        <select
                          value={
                            order.status ||
                            'pending'
                          }
                          onChange={(event) =>
                            handleStatusChange(
                              order.id,
                              event.target
                                .value
                            )
                          }
                          style={
                            selectStyle
                          }
                        >
                          <option value="pending">
                            Pending
                          </option>

                          <option value="processing">
                            Processing
                          </option>

                          <option value="shipped">
                            Shipped
                          </option>

                          <option value="delivered">
                            Delivered
                          </option>

                          <option value="cancelled">
                            Cancelled
                          </option>
                        </select>
                      </td>

                      <td style={tdStyle}>
                        {new Date(
                          order.order_date
                        ).toLocaleString()}
                      </td>

                      <td style={tdStyle}>
                        <button
                          type="button"
                          onClick={() =>
                            handleViewOrder(
                              order
                            )
                          }
                          style={
                            viewButtonStyle
                          }
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {selectedOrder && (
            <div style={orderDetailsStyle}>
              <div style={orderTitleStyle}>
                <h3>
                  Order #{selectedOrder.id}{' '}
                  Details
                </h3>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedOrder(null);
                    setOrderItems([]);
                  }}
                  style={closeButtonStyle}
                >
                  ✕
                </button>
              </div>

              <div
                style={customerDetailsStyle}
              >
                <p>
                  <strong>
                    Customer:
                  </strong>{' '}
                  {selectedOrder.customer_name ||
                    'Not available'}
                </p>

                <p>
                  <strong>Email:</strong>{' '}
                  {selectedOrder.customer_email ||
                    'Not available'}
                </p>

                <p>
                  <strong>Phone:</strong>{' '}
                  {selectedOrder.customer_phone ||
                    'Not available'}
                </p>

                <p>
                  <strong>City:</strong>{' '}
                  {selectedOrder.shipping_city ||
                    'Not available'}
                </p>

                <p>
                  <strong>Address:</strong>{' '}
                  {selectedOrder.shipping_address ||
                    'Not available'}
                </p>

                <p>
                  <strong>Payment:</strong>{' '}
                  {selectedOrder.payment_method ===
                  'credit-card'
                    ? 'Credit Card'
                    : selectedOrder.payment_method ===
                        'cash'
                      ? 'Cash on Delivery'
                      : 'Not available'}
                </p>
              </div>

              <h3>Ordered Products</h3>

              {orderItems.length === 0 ? (
                <p>
                  No products found for this
                  order.
                </p>
              ) : (
                <div
                  style={tableWrapperStyle}
                >
                  <table style={tableStyle}>
                    <thead>
                      <tr
                        style={
                          tableHeaderRowStyle
                        }
                      >
                        <th style={thStyle}>
                          Product
                        </th>

                        <th style={thStyle}>
                          Quantity
                        </th>

                        <th style={thStyle}>
                          Price
                        </th>

                        <th style={thStyle}>
                          Total
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {orderItems.map(
                        (item) => (
                          <tr
                            key={item.id}
                            style={
                              tableRowStyle
                            }
                          >
                            <td style={tdStyle}>
                              {
                                item.product_name
                              }
                            </td>

                            <td style={tdStyle}>
                              {item.quantity}
                            </td>

                            <td style={tdStyle}>
                              ₪
                              {Number(
                                item.price_at_purchase
                              ).toFixed(2)}
                            </td>

                            <td style={tdStyle}>
                              ₪
                              {Number(
                                item.item_total
                              ).toFixed(2)}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          <h3>
            Registered Users ({users.length})
          </h3>

          {users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <div style={tableWrapperStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr
                    style={
                      tableHeaderRowStyle
                    }
                  >
                    <th style={thStyle}>
                      ID
                    </th>

                    <th style={thStyle}>
                      Name
                    </th>

                    <th style={thStyle}>
                      Email
                    </th>

                    <th style={thStyle}>
                      Role
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      style={tableRowStyle}
                    >
                      <td style={tdStyle}>
                        {user.id}
                      </td>

                      <td style={tdStyle}>
                        {user.first_name}{' '}
                        {user.last_name}
                      </td>

                      <td style={tdStyle}>
                        {user.email}
                      </td>

                      <td style={tdStyle}>
                        <strong
                          style={{
                            color:
                              user.role ===
                              'admin'
                                ? '#e74c3c'
                                : '#27ae60'
                          }}
                        >
                          {user.role}
                        </strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'products' && (
        <div>
          <h3>
            Products Inventory (
            {products.length})
          </h3>

          <form
            className="admin-product-form"
            onSubmit={(event) => {
              event.preventDefault();

              if (editingProductId) {
                handleUpdateProduct(
                  editingProductId,
                  form
                );
              } else {
                handleAddProduct(event);
              }
            }}
            style={{
              background: '#f9f9f9',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '25px',
              border: '1px solid #ddd',
              display: 'grid',
              gridTemplateColumns:
                '1fr 1fr',
              gap: '10px'
            }}
          >
            <h4
              className=
                "admin-form-full-width"
              style={{
                gridColumn: 'span 2',
                margin: '0 0 10px'
              }}
            >
              {editingProductId
                ? 'Edit Product'
                : 'Add New Product'}
            </h4>

            <input
              type="text"
              placeholder="Product Name"
              value={form.name}
              onChange={(event) =>
                setForm({
                  ...form,
                  name:
                    event.target.value
                })
              }
              required
              style={inputStyle}
            />

            <input
              type="number"
              placeholder="Price (₪)"
              value={form.price}
              onChange={(event) =>
                setForm({
                  ...form,
                  price:
                    event.target.value
                })
              }
              min="0"
              step="0.01"
              required
              style={inputStyle}
            />

            <input
              type="number"
              placeholder="Stock Quantity"
              value={form.stock}
              onChange={(event) =>
                setForm({
                  ...form,
                  stock:
                    event.target.value
                })
              }
              min="0"
              required
              style={inputStyle}
            />

            <select
              value={form.category}
              onChange={(event) =>
                setForm({
                  ...form,
                  category:
                    event.target.value
                })
              }
              style={inputStyle}
            >
              <option value="ingredients">
                Ingredients
              </option>

              <option value="equipment">
                Equipment
              </option>
            </select>

            <input
              className=
                "admin-form-full-width"
              type="text"
              placeholder="Image URL"
              value={form.image_url}
              onChange={(event) =>
                setForm({
                  ...form,
                  image_url:
                    event.target.value
                })
              }
              style={{
                ...inputStyle,
                gridColumn: 'span 2'
              }}
            />

            <div
              className=
                "admin-form-full-width admin-image-upload"
              style={{
                gridColumn: 'span 2',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
                alignItems: 'center'
              }}
            >
              <input
                type="file"
                accept=
                  "image/jpeg,image/png,image/webp"
                onChange={(event) =>
                  setSelectedImage(
                    event.target.files[0] ||
                      null
                  )
                }
              />

              <button
                type="button"
                onClick={handleImageUpload}
                disabled={
                  !selectedImage ||
                  isUploadingImage
                }
                className="btn-primary"
              >
                {isUploadingImage
                  ? 'Uploading...'
                  : 'Upload Image'}
              </button>
            </div>

            <input
              className=
                "admin-form-full-width"
              type="text"
              placeholder="Description"
              value={form.description}
              onChange={(event) =>
                setForm({
                  ...form,
                  description:
                    event.target.value
                })
              }
              style={{
                ...inputStyle,
                gridColumn: 'span 2'
              }}
            />

            <div
              className=
                "admin-form-full-width admin-form-buttons"
              style={{
                gridColumn: 'span 2',
                display: 'flex',
                gap: '10px'
              }}
            >
              <button
                type="submit"
                className="btn-primary"
                style={{
                  flex: 1,
                  padding: '10px',
                  cursor: 'pointer',
                  background:
                    editingProductId
                      ? '#f39c12'
                      : ''
                }}
              >
                {editingProductId
                  ? 'Update Product'
                  : 'Add Product to DB'}
              </button>

              {editingProductId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingProductId(
                      null
                    );
                    setForm(
                      emptyProductForm
                    );
                    setSelectedImage(null);
                  }}
                  style={
                    cancelEditButtonStyle
                  }
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>

          <div
            className=
              "products-table-wrapper"
            style={tableWrapperStyle}
          >
            <table style={tableStyle}>
              <thead>
                <tr
                  style={
                    tableHeaderRowStyle
                  }
                >
                  <th style={thStyle}>
                    ID
                  </th>

                  <th style={thStyle}>
                    Name
                  </th>

                  <th style={thStyle}>
                    Category
                  </th>

                  <th style={thStyle}>
                    Price
                  </th>

                  <th style={thStyle}>
                    Stock
                  </th>

                  <th style={thStyle}>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {products.map(
                  (product) => (
                    <tr
                      key={product.id}
                      style={tableRowStyle}
                    >
                      <td style={tdStyle}>
                        {product.id}
                      </td>

                      <td style={tdStyle}>
                        {product.name}
                      </td>

                      <td style={tdStyle}>
                        {product.category}
                      </td>

                      <td style={tdStyle}>
                        ₪{product.price}
                      </td>

                      <td style={tdStyle}>
                        <span
                          style={{
                            color:
                              Number(
                                product.stock
                              ) < 5
                                ? '#e74c3c'
                                : '#27ae60',
                            fontWeight:
                              'bold'
                          }}
                        >
                          {product.stock ??
                            'N/A'}
                        </span>
                      </td>

                      <td style={tdStyle}>
                        <button
                          type="button"
                          onClick={() =>
                            handleEditClick(
                              product
                            )
                          }
                          style={
                            editButtonStyle
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteProduct(
                              product.id
                            )
                          }
                          style={
                            deleteButtonStyle
                          }
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {activeTab === 'messages' && (
  <ContactMessages />
)}
{activeTab === 'coupons' && (
  <CouponsPanel />
)}
    </div>
  );
}

const tabStyle = (isActive) => ({
  padding: '10px 20px',
  cursor: 'pointer',
  background: isActive
    ? '#3498db'
    : '#f0f0f0',
  color: isActive ? '#fff' : '#333',
  border: 'none',
  borderRadius: '4px',
  fontWeight: 'bold',
  fontSize: '1rem'
});

const tableWrapperStyle = {
  width: '100%',
  overflowX: 'auto'
};

const tableStyle = {
  width: '100%',
  minWidth: '650px',
  borderCollapse: 'collapse',
  background: '#fff',
  boxShadow:
    '0 2px 4px rgba(0,0,0,0.05)'
};

const tableHeaderRowStyle = {
  background: '#f4f4f4'
};

const tableRowStyle = {
  borderBottom: '1px solid #ddd'
};

const thStyle = {
  padding: '12px',
  textAlign: 'left',
  borderBottom: '2px solid #ddd'
};

const tdStyle = {
  padding: '12px',
  textAlign: 'left'
};

const inputStyle = {
  width: '100%',
  padding: '8px',
  borderRadius: '4px',
  border: '1px solid #ccc',
  boxSizing: 'border-box'
};

const selectStyle = {
  padding: '7px',
  border: '1px solid #ccc',
  borderRadius: '4px',
  backgroundColor: '#fff',
  cursor: 'pointer'
};

const viewButtonStyle = {
  padding: '7px 12px',
  border: 'none',
  borderRadius: '4px',
  backgroundColor: '#3498db',
  color: '#fff',
  cursor: 'pointer'
};

const editButtonStyle = {
  cursor: 'pointer',
  padding: '5px 10px',
  background: '#f39c12',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  marginRight: '8px',
  marginBottom: '4px'
};

const deleteButtonStyle = {
  cursor: 'pointer',
  padding: '5px 10px',
  background: '#e74c3c',
  color: '#fff',
  border: 'none',
  borderRadius: '4px'
};

const cancelEditButtonStyle = {
  flex: 1,
  padding: '10px',
  cursor: 'pointer',
  background: '#95a5a6',
  color: '#fff',
  border: 'none',
  borderRadius: '4px'
};

const orderDetailsStyle = {
  marginTop: '30px',
  padding: '25px',
  backgroundColor: '#fff',
  border: '1px solid #ddd',
  boxShadow:
    '0 4px 12px rgba(0,0,0,0.08)'
};

const orderTitleStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const closeButtonStyle = {
  border: 'none',
  background: 'none',
  fontSize: '1.4rem',
  cursor: 'pointer'
};

const customerDetailsStyle = {
  display: 'grid',
  gridTemplateColumns:
    'repeat(auto-fit, minmax(250px, 1fr))',
  gap: '10px 30px',
  marginBottom: '25px'
};