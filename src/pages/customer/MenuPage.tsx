import React, { useContext, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/auth-context';
import { useCart } from '../../context/CartContext';
import { useMenuCategories } from '../../hooks/useMenuCategories';
import { useMenuItems } from '../../hooks/useMenuItems';

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatPrice = (price: number) =>
  `LKR ${Number.isFinite(price) ? price.toLocaleString() : '—'}`;

// ── Spinner ───────────────────────────────────────────────────────────────────

const Spinner: React.FC = () => (
  <div className="flex justify-center py-16">
    <div className="w-10 h-10 rounded-full border-[3px] border-[rgba(255,107,53,0.2)] border-t-[#FF6B35] animate-spin" />
  </div>
);

// ── MenuPage ──────────────────────────────────────────────────────────────────

const MenuPage: React.FC = () => {
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  const { addItem, totalItems } = useCart();

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const { categories, loading: categoriesLoading } = useMenuCategories();
  const { items, loading: itemsLoading } = useMenuItems({ includeUnavailable: false });

  // Client-side filtering by category + search
  const filteredItems = useMemo(() => {
    let result = items;
    if (selectedCategoryId) {
      result = result.filter((i) => i.category_id === selectedCategoryId);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          (i.description ?? '').toLowerCase().includes(q),
      );
    }
    return result;
  }, [items, selectedCategoryId, searchQuery]);

  const handleAddToCart = (item: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
  }) => {
    if (!auth?.user) {
      navigate('/login');
      return;
    }
    addItem({
      menu_item_id: item.id,
      name: item.name,
      price: item.price,
      image_url: item.image_url,
    });
    setAddedIds((prev) => {
      const next = new Set(prev);
      next.add(item.id);
      return next;
    });
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }, 1200);
  };

  const isLoading = categoriesLoading || itemsLoading;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff' }}>
      {/* ── Topbar ────────────────────────────────────────────────────────── */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          background: 'rgba(10,10,10,0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <Link
          to="/"
          style={{ fontSize: '22px', fontWeight: 700, textDecoration: 'none', color: 'inherit' }}
        >
          <span style={{ color: '#fff' }}>Din</span>
          <span style={{ color: '#FF6B35' }}>ely</span>
        </Link>

        <div className="flex items-center gap-4">
          {auth?.user ? (
            <>
              <Link
                to="/dinely/customer/dashboard"
                className="text-sm font-medium hover:text-[#FF6B35] transition-colors"
                style={{ color: '#A0A0A0', textDecoration: 'none' }}
              >
                Dashboard
              </Link>
              <Link
                to="/cart"
                className="relative flex items-center gap-2 text-sm font-semibold"
                style={{
                  background: '#FF6B35',
                  color: '#fff',
                  padding: '7px 16px',
                  borderRadius: '50px',
                  textDecoration: 'none',
                }}
              >
                🛒 Cart
                {totalItems > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-6px',
                      right: '-6px',
                      background: '#fff',
                      color: '#FF6B35',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      fontSize: '11px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {totalItems}
                  </span>
                )}
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={{ color: '#A0A0A0', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}
              >
                Sign In
              </Link>
              <Link
                to="/register"
                style={{
                  background: '#FF6B35',
                  color: '#fff',
                  padding: '7px 18px',
                  borderRadius: '50px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </header>

      {/* ── Page heading ─────────────────────────────────────────────────── */}
      <div className="container" style={{ paddingTop: '48px', paddingBottom: '24px' }}>
        <h1 style={{ fontSize: '40px', fontWeight: 700, marginBottom: '8px' }}>
          Our <span style={{ color: '#FF6B35' }}>Menu</span>
        </h1>
        <p className="text-muted" style={{ fontSize: '16px' }}>
          Browse our full selection and add items to your cart.
        </p>
      </div>

      {/* ── Search bar ───────────────────────────────────────────────────── */}
      <div className="container" style={{ paddingBottom: '20px' }}>
        <input
          type="search"
          placeholder="Search by name or description…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field"
          style={{ maxWidth: '480px' }}
        />
      </div>

      {/* ── Category filter ──────────────────────────────────────────────── */}
      {!categoriesLoading && categories.length > 0 && (
        <div
          className="container"
          style={{
            paddingBottom: '32px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <button
            type="button"
            onClick={() => setSelectedCategoryId(null)}
            style={{
              padding: '8px 18px',
              borderRadius: '50px',
              border: selectedCategoryId === null ? 'none' : '1px solid rgba(255,255,255,0.15)',
              background: selectedCategoryId === null ? '#FF6B35' : 'transparent',
              color: selectedCategoryId === null ? '#fff' : '#A0A0A0',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif",
              transition: 'all 0.15s',
            }}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategoryId(cat.id)}
              style={{
                padding: '8px 18px',
                borderRadius: '50px',
                border:
                  selectedCategoryId === cat.id
                    ? 'none'
                    : '1px solid rgba(255,255,255,0.15)',
                background: selectedCategoryId === cat.id ? '#FF6B35' : 'transparent',
                color: selectedCategoryId === cat.id ? '#fff' : '#A0A0A0',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                transition: 'all 0.15s',
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* ── Item grid ────────────────────────────────────────────────────── */}
      <div className="container" style={{ paddingBottom: '80px' }}>
        {isLoading && <Spinner />}

        {!isLoading && filteredItems.length === 0 && (
          <div
            className="glass-card"
            style={{
              padding: '60px',
              textAlign: 'center',
              color: '#A0A0A0',
            }}
          >
            <p style={{ fontSize: '40px', marginBottom: '12px' }}>🍽️</p>
            <p style={{ fontSize: '16px', fontWeight: 600 }}>No items found.</p>
            {searchQuery && (
              <p style={{ fontSize: '14px', marginTop: '8px' }}>
                Try a different search term or clear the filter.
              </p>
            )}
          </div>
        )}

        {!isLoading && filteredItems.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '20px',
            }}
          >
            {filteredItems.map((item) => {
              const added = addedIds.has(item.id);
              return (
                <div
                  key={item.id}
                  className="glass-card"
                  style={{
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s',
                  }}
                >
                  {/* Image */}
                  <div style={{ position: 'relative', height: '180px', background: '#111' }}>
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '48px',
                          background: 'rgba(255,107,53,0.05)',
                        }}
                      >
                        🍽️
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3
                      style={{
                        fontSize: '17px',
                        fontWeight: 700,
                        marginBottom: '6px',
                        lineHeight: 1.3,
                      }}
                    >
                      {item.name}
                    </h3>
                    {item.description && (
                      <p
                        className="text-muted"
                        style={{
                          fontSize: '13px',
                          lineHeight: 1.5,
                          marginBottom: '16px',
                          flex: 1,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {item.description}
                      </p>
                    )}

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: 'auto',
                        paddingTop: '12px',
                      }}
                    >
                      <span style={{ fontSize: '18px', fontWeight: 700, color: '#FF6B35' }}>
                        {formatPrice(item.price)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddToCart(item)}
                        style={{
                          padding: '8px 16px',
                          borderRadius: '50px',
                          border: 'none',
                          background: added ? '#3fb950' : '#FF6B35',
                          color: '#fff',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontFamily: "'Inter', sans-serif",
                          transition: 'background 0.2s',
                          minWidth: '110px',
                        }}
                      >
                        {added ? '✓ Added' : '+ Add to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;
