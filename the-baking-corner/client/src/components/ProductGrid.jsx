import { useMemo, useState } from 'react';

const getRemainingStock = (product, cart) => {
  const cartItem = cart.find(
    (item) =>
      Number(item.id) === Number(product.id)
  );

  const quantityInCart = cartItem
    ? Number(cartItem.quantity)
    : 0;

  return Math.max(
    0,
    Number(product.stock) - quantityInCart
  );
};

const ProductGrid = ({
  products = [],
  onAddToCart,
  cart = []
}) => {
  const [searchTerm, setSearchTerm] =
    useState('');

  const [selectedCategory, setSelectedCategory] =
    useState('all');

  const [sortBy, setSortBy] =
    useState('default');

  const [inStockOnly, setInStockOnly] =
    useState(false);

  const categories = useMemo(() => {
    return [
      ...new Set(
        products
          .map((product) => product.category)
          .filter(Boolean)
      )
    ];
  }, [products]);

  const visibleProducts = useMemo(() => {
    let result = [...products];

    const normalizedSearch =
      searchTerm.trim().toLowerCase();

    if (normalizedSearch) {
      result = result.filter((product) => {
        const name =
          product.name?.toLowerCase() || '';

        const description =
          product.description?.toLowerCase() || '';

        return (
          name.includes(normalizedSearch) ||
          description.includes(normalizedSearch)
        );
      });
    }

    if (selectedCategory !== 'all') {
      result = result.filter(
        (product) =>
          product.category === selectedCategory
      );
    }

    if (inStockOnly) {
      result = result.filter(
        (product) =>
          getRemainingStock(product, cart) > 0
      );
    }

    if (sortBy === 'price-low') {
      result.sort(
        (firstProduct, secondProduct) =>
          Number(firstProduct.price) -
          Number(secondProduct.price)
      );
    }

    if (sortBy === 'price-high') {
      result.sort(
        (firstProduct, secondProduct) =>
          Number(secondProduct.price) -
          Number(firstProduct.price)
      );
    }

    if (sortBy === 'name') {
      result.sort((firstProduct, secondProduct) =>
        firstProduct.name.localeCompare(
          secondProduct.name
        )
      );
    }

    return result;
  }, [
    products,
    cart,
    searchTerm,
    selectedCategory,
    sortBy,
    inStockOnly
  ]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortBy('default');
    setInStockOnly(false);
  };

  return (
    <div style={{ width: '100%' }}>
      <section
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '15px',
          marginBottom: '25px',
          padding: '18px',
          border:
            '1px solid var(--border-light)',
          backgroundColor: '#fff'
        }}
      >
        <input
          type="search"
          value={searchTerm}
          onChange={(event) =>
            setSearchTerm(event.target.value)
          }
          placeholder="Search products..."
          aria-label="Search products"
          style={{
            width: '100%',
            padding: '11px',
            border: '1px solid #ccc',
            boxSizing: 'border-box'
          }}
        />

        <select
          value={selectedCategory}
          onChange={(event) =>
            setSelectedCategory(
              event.target.value
            )
          }
          aria-label="Filter by category"
          style={{
            width: '100%',
            padding: '11px',
            border: '1px solid #ccc',
            backgroundColor: '#fff'
          }}
        >
          <option value="all">
            All Categories
          </option>

          {categories.map((category) => (
            <option
              key={category}
              value={category}
            >
              {category.charAt(0).toUpperCase() +
                category.slice(1)}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(event) =>
            setSortBy(event.target.value)
          }
          aria-label="Sort products"
          style={{
            width: '100%',
            padding: '11px',
            border: '1px solid #ccc',
            backgroundColor: '#fff'
          }}
        >
          <option value="default">
            Default Order
          </option>

          <option value="name">
            Name: A–Z
          </option>

          <option value="price-low">
            Price: Low to High
          </option>

          <option value="price-high">
            Price: High to Low
          </option>
        </select>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            minHeight: '42px',
            cursor: 'pointer'
          }}
        >
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(event) =>
              setInStockOnly(
                event.target.checked
              )
            }
          />

          In Stock Only
        </label>

        <button
          type="button"
          onClick={clearFilters}
          style={{
            padding: '11px',
            border: '1px solid #555',
            backgroundColor: '#fff',
            cursor: 'pointer'
          }}
        >
          Clear Filters
        </button>
      </section>

      <p
        style={{
          marginBottom: '18px',
          color: 'var(--text-muted)'
        }}
      >
        {visibleProducts.length}{' '}
        {visibleProducts.length === 1
          ? 'product found'
          : 'products found'}
      </p>

      {visibleProducts.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '50px 20px',
            border:
              '1px solid var(--border-light)',
            backgroundColor: '#fff'
          }}
        >
          <h3>No products found</h3>

          <p>
            Try changing the search or filters.
          </p>

          <button
            type="button"
            className="btn-primary"
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '24px'
          }}
        >
          {visibleProducts.map(
            (item, index) => {
              const remainingStock =
                getRemainingStock(item, cart);

              return (
                <div
                  key={item.id || index}
                  className="product-card"
                >
                  <div className="image-container">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="product-image"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain'
                      }}
                      onError={(event) => {
                        event.currentTarget.onerror =
                          null;

                        event.currentTarget.src =
                          'https://via.placeholder.com/200?text=No+Image';
                      }}
                    />
                  </div>

                  <div className="product-info">
                    <h3
                      className="product-title"
                      style={{
                        margin: '0 0 10px',
                        textAlign: 'center'
                      }}
                    >
                      {item.name}
                    </h3>

                    <p
                      style={{
                        color:
                          'var(--text-muted)',
                        fontSize: '0.95rem',
                        textAlign: 'center'
                      }}
                    >
                      {item.description}
                    </p>

                    <p
                      style={{
                        fontWeight: '600',
                        fontSize: '1.25rem',
                        textAlign: 'center',
                        color:
                          'var(--text-main)'
                      }}
                    >
                      ₪{Number(item.price).toFixed(2)}
                    </p>

                    <p
                      style={{
                        textAlign: 'center',
                        minHeight: '20px',
                        margin: '0 0 15px',
                        fontSize: '0.9rem',
                        fontWeight:
                          remainingStock <= 5
                            ? 'bold'
                            : 'normal',
                        color:
                          remainingStock <= 0
                            ? '#e74c3c'
                            : remainingStock <= 5
                              ? '#e67e22'
                              : 'var(--text-muted)'
                      }}
                    >
                      {remainingStock <= 0
                        ? 'No more units available'
                        : remainingStock === 1
                          ? 'Only 1 unit left'
                          : remainingStock <= 5
                            ? `Only ${remainingStock} units left`
                            : `${remainingStock} units available`}
                    </p>

                    <button
                      type="button"
                      className="btn-primary add-to-cart-btn"
                      style={{
                        width: '100%',
                        opacity:
                          remainingStock <= 0
                            ? 0.5
                            : 1,
                        cursor:
                          remainingStock <= 0
                            ? 'not-allowed'
                            : 'pointer'
                      }}
                      onClick={() =>
                        onAddToCart(item)
                      }
                      disabled={
                        remainingStock <= 0
                      }
                    >
                      {remainingStock <= 0
                        ? 'Out of Stock'
                        : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              );
            }
          )}
        </div>
      )}
    </div>
  );
};

export default ProductGrid;