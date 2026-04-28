import React from 'react';
import Navbar from '../components/Navbar';

const LandingPage: React.FC = () => {
  return (
    <div>
      <Navbar />
      <main>
        {/* HERO SECTION */}
        <section id="home" style={{ 
          minHeight: '100vh', 
          padding: '120px 5% 60px', 
          display: 'flex', 
          alignItems: 'center',
          background: 'radial-gradient(ellipse 70% 60% at 20% 50%, rgba(255,107,53,0.12), transparent), radial-gradient(ellipse 60% 50% at 80% 30%, rgba(0,201,167,0.07), transparent)'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', width: '100%', alignItems: 'center', gap: '40px' }}>
            <div style={{ flex: '1 1 50%', minWidth: '300px' }}>
              <div style={{ display: 'inline-block', border: '1px solid #FF6B35', color: '#FF6B35', borderRadius: '50px', padding: '6px 16px', fontSize: '13px', fontWeight: 600, marginBottom: '24px' }}>
                🍴 World Class Dining Experience
              </div>
              <h1 style={{ fontSize: '72px', fontWeight: 800, lineHeight: 1.1, marginBottom: '24px' }}>
                <span style={{ color: '#fff' }}>Experience the</span><br />
                <span className="text-orange" style={{ fontStyle: 'italic' }}>Taste</span>
                <span style={{ color: '#fff' }}> of the</span><br />
                <span style={{ color: '#fff' }}>World</span>
              </h1>
              <p className="text-muted" style={{ fontSize: '18px', lineHeight: 1.6, maxWidth: '500px', marginBottom: '40px' }}>
                From classic favorites to exotic delights, explore a diverse menu inspired by cuisines from across the globe.
              </p>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '60px' }}>
                <button className="btn-primary">Explore Menu</button>
                <button className="btn-ghost">Learn More</button>
              </div>

              {/* Promo ticket */}
              <div className="glass-card" style={{ 
                display: 'inline-flex', alignItems: 'center', padding: '16px 24px', 
                borderRadius: '50px', gap: '24px', position: 'relative' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ display: 'flex' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#FF6B35', border: '2px solid #111', marginLeft: '0', zIndex: 3 }}></div>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#00C9A7', border: '2px solid #111', marginLeft: '-12px', zIndex: 2 }}></div>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#a259f7', border: '2px solid #111', marginLeft: '-12px', zIndex: 1 }}></div>
                  </div>
                  <div style={{ fontSize: '13px', color: '#A0A0A0', lineHeight: 1.3, maxWidth: '100px' }}>People grabbed the offer</div>
                </div>
                <div style={{ width: '1px', height: '40px', background: 'rgba(255,255,255,0.1)' }}></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className="text-orange" style={{ fontSize: '32px', fontWeight: 800 }}>50%</span>
                  <span style={{ fontSize: '13px', color: '#A0A0A0', lineHeight: 1.3, maxWidth: '80px' }}>off on First Order</span>
                </div>
              </div>
            </div>

            <div style={{ flex: '1 1 40%', display: 'flex', justifyContent: 'center', position: 'relative' }}>
              <div style={{ position: 'relative' }}>
                <img src="https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=700&q=80" alt="Ramen" style={{ 
                  width: '500px', height: '500px', objectFit: 'cover', borderRadius: '50%',
                  boxShadow: '0 0 80px rgba(255,107,53,0.25)'
                }} />
                
                <div className="glass-card" style={{ position: 'absolute', top: '40px', right: '-20px', padding: '12px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '14px' }}>
                  ⭐ 4.9 Rating
                </div>
                <div className="glass-card" style={{ position: 'absolute', bottom: '60px', left: '-40px', padding: '12px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '14px' }}>
                  🚚 Fast Delivery
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BEST DISHES SECTION */}
        <section id="menu" className="container" style={{ padding: '80px 24px' }}>
          <h2 style={{ fontSize: '40px', fontWeight: 700, textAlign: 'center', marginBottom: '60px' }}>
            <span style={{ opacity: 0.5 }}>[</span> Our Best <span className="text-orange">Delivered</span> <span style={{ opacity: 0.5 }}>]</span>
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
            {[
              { img: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80', name: 'Gourmet Breakfast', desc: 'Fresh eggs, artisan bread, and herbs.', price: '$12.99' },
              { img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80', name: 'Classic Burger', desc: 'Juicy beef patty with fresh veggies.', price: '$14.99' },
              { img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80', name: 'Wood-fired Pizza', desc: 'Authentic Italian pizza with mozzarella.', price: '$18.99' }
            ].map((dish, idx) => (
              <div key={idx} className="glass-card" style={{ display: 'flex', padding: '20px', gap: '20px', alignItems: 'center' }}>
                <img src={dish.img} alt={dish.name} style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '16px' }} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>{dish.name}</h3>
                  <p className="text-muted" style={{ fontSize: '14px', marginBottom: '12px' }}>{dish.desc}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '20px', fontWeight: 700 }}>{dish.price}</span>
                    <button style={{ background: '#FF6B35', color: '#fff', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>🛒</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CHEFS SECTION */}
        <section id="about" className="container" style={{ padding: '80px 24px' }}>
          <h2 style={{ fontSize: '40px', fontWeight: 700, textAlign: 'center', marginBottom: '60px' }}>
            <span style={{ opacity: 0.5 }}>[</span> Meet Our <span className="text-orange">Chefs</span> <span style={{ opacity: 0.5 }}>]</span>
          </h2>
          <div className="glass-card" style={{ display: 'flex', flexWrap: 'wrap', overflow: 'hidden' }}>
            <div style={{ flex: '1 1 40%', minWidth: '300px' }}>
              <img src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&q=80" alt="Chef" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRight: '1px solid rgba(255,107,53,0.3)' }} />
            </div>
            <div style={{ flex: '1 1 60%', padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h3 style={{ fontSize: '28px', marginBottom: '24px' }}>Masters of Flavor</h3>
              <p className="text-muted" style={{ fontSize: '18px', lineHeight: 1.7, marginBottom: '32px' }}>
                Our expert chefs bring passion, skill, and creativity to every dish, ensuring an unforgettable dining experience. With years of experience and a love for flavors, they craft each meal to perfection, using only the finest ingredients.
              </p>
              <div>
                <button className="btn-ghost">View All</button>
              </div>
            </div>
          </div>
        </section>

        {/* REVIEWS SECTION */}
        <section id="specials" className="container" style={{ padding: '80px 24px' }}>
          <h2 style={{ fontSize: '40px', fontWeight: 700, textAlign: 'center', marginBottom: '60px' }}>
            <span style={{ opacity: 0.5 }}>[</span> What They <span className="text-orange">Say?</span> <span style={{ opacity: 0.5 }}>]</span>
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: `hsl(${i * 60}, 70%, 40%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    JD
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '18px' }}>Jane Doe</h4>
                    <div className="text-orange" style={{ fontSize: '14px', letterSpacing: '2px' }}>★★★★★</div>
                  </div>
                </div>
                <p className="text-muted" style={{ fontStyle: 'italic', lineHeight: 1.7 }}>
                  "Absolutely loved the flavors! The food was fresh, and the delivery was super fast. Highly recommended."
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer style={{ background: 'rgba(10,10,10,0.95)', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '80px' }}>
        <div className="container" style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', padding: '60px 24px', justifyContent: 'space-between' }}>
          <div style={{ flex: '1 1 300px' }}>
            <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px' }}><span className="text-orange">Din</span>ely</h2>
            <p className="text-muted" style={{ marginBottom: '24px' }}>Crafted with care. Served with passion.</p>
            <div style={{ display: 'flex', gap: '16px' }}>
              {['🐦', '📸', '📘', '🎵'].map(icon => (
                <a href="#" key={icon} style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#FF6B35'} onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>{icon}</a>
              ))}
            </div>
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <h4 style={{ marginBottom: '20px', fontSize: '18px' }}>Quick Links</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px', color: '#A0A0A0' }}>
              <li><a href="#home">Home</a></li>
              <li><a href="#menu">Menu</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          <div style={{ flex: '1 1 200px' }}>
            <h4 style={{ marginBottom: '20px', fontSize: '18px' }}>Policy</h4>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '12px', color: '#A0A0A0' }}>
              <li><a href="#">Privacy</a></li>
              <li><a href="#">Terms</a></li>
              <li><a href="#">Data Protection</a></li>
            </ul>
          </div>
          <div style={{ flex: '1 1 300px' }}>
            <h4 style={{ marginBottom: '20px', fontSize: '18px' }}>Sign Up For Our Newsletter</h4>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="email" placeholder="Your email address" className="input-field" style={{ flex: 1 }} />
              <button className="btn-primary" style={{ padding: '13px 20px' }}>Subscribe</button>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '24px', textAlign: 'center', color: '#A0A0A0', fontSize: '14px' }}>
          © 2025 Dinely. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
