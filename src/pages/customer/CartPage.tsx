import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/auth-context';
import { useCart } from '../../context/CartContext';
import { usePlaceOrder } from '../../hooks/usePlaceOrder';

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatPrice = (price: number) =>
  `LKR ${Number.isFinite(price) ? price.toLocaleString() : '—'}`;

// ── CartPage ──────────────────────────────────────────────────────────────────

const CartPage: React.FC = () => {
  const { items, totalItems, totalPrice, removeItem, setQuantity, clearCart } = useCart();
  const { placeOrder, loading } = usePlaceOrder();
  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  const [notes, setNotes] = useState('');
  const [placingError, setPlacingError] = useState<string | null>(null);

  const handleQuantityChange = (menuItemId: string, delta: number, current: number) => {
    const next = current + delta;
    setQuantity(menuItemId, next);
  };

  const handlePlaceOrder = async () => {
    setPlacingError(null);
    if (!auth?.user) {
      navigate('/login');
      return;
    }
    if (items.length === 0) {
      setPlacingError('Your cart is empty.');
      return;
    }
    try {
      await placeOrder({
        items: items.map((i) => ({ menu_item_id: i.menu_item_id, quantity: i.quantity })),
        notes: notes.trim() || undefined,
      });
      clearCart();
      navigate('/dinely/customer/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to place order.';
      setPlacingError(msg);
    }
  };

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
          <Link
            to="/menu"
            style={{ color: '#A0A0A0', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}
          >
            ← Continue Shopping
          </Link>
          <Link
            to="/dinely/customer/dashboard"
            style={{ color: '#A0A0A0', textDecoration: 'none', fontSize: '14px', fontWeight: 500 }}
          >
            Dashboard
          </Link>
        </div>
      </header>

      <div className="container" style={{ paddingTop: '48px', paddingBottom: '80px', maxWidth: '800px' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '8px' }}>
          Your <span style={{ color: '#FF6B35' }}>Cart</span>
        </h1>
        <p className="text-muted" style={{ fontSize: '15px', marginBottom: '32px' }}>
          {totalItems === 0
            ? 'Your cart is empty.'
            : `${totalItems} item${totalItems !== 1 ? 's' : ''} selected`}
        </p>

        {/* ── Empty state ───────────────────────────────────────────────── */}
        {items.length === 0 && (
          <div
            className="glass-card"
            style={{
              padding: '60px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <span style={{ fontSize: '48px' }}>🛒</span>
            <p style={{ fontSize: '18px', fontWeight: 600 }}>Nothing in your cart yet</p>
            <p className="text-muted" style={{ fontSize: '14px' }}>
              Head to the menu to add some items.
            </p>
            <Link
              to="/menu"
              className="btn-primary"
              style={{ marginTop: '8px', textDecoration: 'none' }}
            >
              Browse Menu
            </Link>
          </div>
        )}

        {/* ── Cart items ────────────────────────────────────────────────── */}
        {items.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Items list */}
            <div className="glass-card" style={{ overflow: 'hidden' }}>
              {items.map((item, idx) => (
                <div
                  key={item.menu_item_id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    padding: '20px 24px',
                    borderBottom:
                      idx < items.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  }}
                >
                  {/* Thumbnail */}
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '12px',
                      background: '#111',
                      flexShrink: 0,
                      overflow: 'hidden',
                    }}
                  >
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
                          fontSize: '24px',
                          background: 'rgba(255,107,53,0.07)',
                        }}
                      >
                        🍽️
                      </div>
                    )}
                  </div>

                  {/* Name + price */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: '15px', marginBottom: '4px' }}>
                      {item.name}
                    </p>
                    <p className="text-muted" style={{ fontSize: '13px' }}>
                      {formatPrice(item.price)} each
                    </p>
                  </div>

                  {/* Quantity stepper */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0',
                      background: 'rgba(255,255,255,0.05)',
                      borderRadius: '8px',
                      overflow: 'hidden',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(item.menu_item_id, -1, item.quantity)}
                      style={{
                        width: '36px',
                        height: '36px',
                        background: 'none',
                        border: 'none',
                        color: '#A0A0A0',
                        fontSize: '18px',
                        cursor: 'pointer',
                        fontFamily: "'Inter', sans-serif",
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      −
                    </button>
                    <span
                      style={{
                        minWidth: '32px',
                        textAlign: 'center',
                        fontSize: '15px',
                        fontWeight: 600,
                      }}
                    >
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleQuantityChange(item.menu_item_id, 1, item.quantity)}
                      style={{
                        width: '36px',
                        height: '36px',
                        background: 'none',
                        border: 'none',
                        color: '#A0A0A0',
                        fontSize: '18px',
                        cursor: 'pointer',
                        fontFamily: "'Inter', sans-serif",
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div style={{ minWidth: '100px', textAlign: 'right' }}>
                    <p style={{ fontSize: '15px', fontWeight: 700, color: '#FF6B35' }}>
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => removeItem(item.menu_item_id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#6e7681',
                      fontSize: '18px',
                      cursor: 'pointer',
                      padding: '4px',
                      lineHeight: 1,
                      flexShrink: 0,
                    }}
                    aria-label={`Remove ${item.name}`}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {/* Notes */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <label
                htmlFor="order-notes"
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#A0A0A0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  marginBottom: '10px',
                }}
              >
                Special Instructions (optional)
              </label>
              <textarea
                id="order-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="E.g. no onions, extra spicy, allergies…"
                rows={3}
                className="input-field"
                style={{ resize: 'vertical', minHeight: '80px' }}
              />
            </div>

            {/* Order summary */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
                Order Summary
              </h2>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  marginBottom: '20px',
                }}
              >
                {items.map((item) => (
                  <div
                    key={item.menu_item_id}
                    style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}
                  >
                    <span className="text-muted">
                      {item.name} × {item.quantity}
                    </span>
                    <span>{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div
                style={{
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  paddingTop: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: '16px', fontWeight: 600 }}>Total</span>
                <span style={{ fontSize: '22px', fontWeight: 700, color: '#FF6B35' }}>
                  {formatPrice(totalPrice)}
                </span>
              </div>
            </div>

            {/* Error banner */}
            {placingError && (
              <div
                style={{
                  padding: '14px 18px',
                  background: 'rgba(248,81,73,0.1)',
                  border: '1px solid rgba(248,81,73,0.2)',
                  borderRadius: '10px',
                  color: '#f85149',
                  fontSize: '14px',
                }}
              >
                {placingError}
              </div>
            )}

            {/* Place order button */}
            <button
              type="button"
              onClick={() => void handlePlaceOrder()}
              disabled={loading || items.length === 0}
              className="btn-primary"
              style={{
                padding: '16px',
                fontSize: '16px',
                width: '100%',
                opacity: loading || items.length === 0 ? 0.6 : 1,
                cursor: loading || items.length === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Placing Order…' : `Place Order · ${formatPrice(totalPrice)}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
