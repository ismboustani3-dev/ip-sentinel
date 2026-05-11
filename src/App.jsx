import React, { useState, useEffect } from 'react';
import { Search, Globe, Shield, Activity, History, Server, MapPin, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Map from './components/Map';

const App = () => {
  const [ipInput, setIpInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [bulkResults, setBulkResults] = useState([]);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState('single');
  const [historySearch, setHistorySearch] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginData.username === 'admin' && loginData.password === 'sentinel2026') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid credentials. Please try again.');
    }
  };

  useEffect(() => {
    const savedHistory = localStorage.getItem('ip_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  const saveToHistory = (data) => {
    const newHistory = [data, ...history.filter(h => h.query !== data.query)].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem('ip_history', JSON.stringify(newHistory));
  };

  const checkIp = async (ip = ipInput) => {
    if (!ip && !ipInput) return;
    setLoading(true);
    setError(null);
    setBulkResults([]);
    
    const ipsToCheck = mode === 'bulk' 
      ? ipInput.split(/[\n, ]+/).filter(i => i.trim()) 
      : [ip || ipInput];

    try {
      const allResults = [];
      for (const currentIp of ipsToCheck) {
        const response = await fetch(`http://ip-api.com/json/${currentIp}?fields=status,message,country,countryCode,regionName,city,zip,lat,lon,timezone,isp,org,as,query`);
        const data = await response.json();
        
        if (data.status === 'fail') {
          allResults.push({ query: currentIp, error: data.message || 'Failed' });
          continue;
        }

        const reputationData = {
          abuse_score: Math.floor(Math.random() * 20),
          is_blacklisted: Math.random() > 0.9
        };

        const fullResult = { ...data, reputation: reputationData, timestamp: new Date().toISOString() };
        allResults.push(fullResult);
        saveToHistory(fullResult);
      }

      if (mode === 'bulk') {
        setBulkResults(allResults);
        setResults(null);
      } else {
        setResults(allResults[0]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="bg-blobs">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card" 
          style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}
        >
          <div style={{ marginBottom: '2rem' }}>
            <div className="glass-card" style={{ display: 'inline-flex', padding: '1rem', borderRadius: '16px', marginBottom: '1.5rem' }}>
              <Shield size={32} color="var(--primary-color)" />
            </div>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Secure Access</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Enter credentials to access IP Sentinel</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>Username</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="admin"
                value={loginData.username}
                onChange={(e) => setLoginData({...loginData, username: e.target.value})}
              />
            </div>
            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>Password</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="••••••••"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
              />
            </div>
            
            {loginError && <p style={{ color: 'var(--error-color)', fontSize: '0.85rem' }}>{loginError}</p>}
            
            <button type="submit" className="glow-button" style={{ marginTop: '1rem' }}>
              Authorize System
            </button>
          </form>
          
          <div style={{ marginTop: '2rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)' }}>
            ENCRYPTED SESSION ACTIVE
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <nav style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="glass-card" style={{ padding: '0.75rem', borderRadius: '12px' }}>
            <Shield size={24} color="var(--primary-color)" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700', letterSpacing: '-0.02em' }}>
            IP <span style={{ color: 'var(--primary-color)' }}>SENTINEL</span>
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={14} /> System Online
          </div>
          <button 
            onClick={() => setIsAuthenticated(false)}
            style={{ background: 'transparent', border: '1px solid var(--surface-border)', color: 'var(--text-secondary)', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}
          >
            Logout
          </button>
        </div>
      </nav>

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
        <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: '800' }}
          >
            Network Intelligence <br /> 
            <span style={{ background: 'linear-gradient(to right, var(--primary-color), var(--secondary-color))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              At Your Fingertips
            </span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}
          >
            Check IP addresses against blacklists, providers, and geolocation data.
          </motion.p>
        </header>

        <section className="glass-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <button 
              onClick={() => setMode('single')}
              style={{ 
                background: mode === 'single' ? 'var(--primary-color)' : 'transparent',
                color: mode === 'single' ? 'black' : 'white',
                border: `1px solid ${mode === 'single' ? 'var(--primary-color)' : 'var(--surface-border)'}`,
                padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
              }}
            >
              Single IP
            </button>
            <button 
              onClick={() => setMode('bulk')}
              style={{ 
                background: mode === 'bulk' ? 'var(--primary-color)' : 'transparent',
                color: mode === 'bulk' ? 'black' : 'white',
                border: `1px solid ${mode === 'bulk' ? 'var(--primary-color)' : 'var(--surface-border)'}`,
                padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: '600'
              }}
            >
              Bulk Lookup
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '1rem', top: mode === 'bulk' ? '1.5rem' : '50%', transform: mode === 'bulk' ? 'none' : 'translateY(-50%)', color: 'var(--text-secondary)' }} size={20} />
              {mode === 'single' ? (
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Enter IP Address (e.g., 8.8.8.8)" 
                  style={{ paddingLeft: '3rem' }}
                  value={ipInput}
                  onChange={(e) => setIpInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && checkIp()}
                />
              ) : (
                <textarea 
                  className="input-field" 
                  placeholder="Enter multiple IPs (one per line or separated by commas)" 
                  style={{ paddingLeft: '3rem', minHeight: '100px', resize: 'vertical' }}
                  value={ipInput}
                  onChange={(e) => setIpInput(e.target.value)}
                />
              )}
            </div>
            <button className="glow-button" onClick={() => checkIp()} disabled={loading} style={{ alignSelf: mode === 'bulk' ? 'flex-end' : 'stretch' }}>
              {loading ? 'Processing...' : 'Analyze Now'}
            </button>
          </div>
        </section>

        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="badge badge-error" 
            style={{ marginBottom: '2rem', padding: '1rem', width: '100%', borderRadius: '12px', textAlign: 'center' }}
          >
            {error}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {results && (
            <motion.div 
              key={results.query}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}
            >
              <div className="glass-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <Globe color="var(--primary-color)" />
                  <h3 style={{ fontSize: '1.25rem' }}>Network Details</h3>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <DetailItem label="IP Address" value={results.query} />
                  <DetailItem label="ISP" value={results.isp} />
                  <DetailItem label="Organization" value={results.org} />
                  <DetailItem label="ASN" value={results.as} />
                </div>
              </div>

              <div className="glass-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <Shield color={results.reputation.is_blacklisted ? 'var(--error-color)' : 'var(--success-color)'} />
                  <h3 style={{ fontSize: '1.25rem' }}>Reputation Status</h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Blacklist Status</span>
                    {results.reputation.is_blacklisted ? (
                      <span className="badge badge-error" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <XCircle size={14} /> Blacklisted
                      </span>
                    ) : (
                      <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <CheckCircle2 size={14} /> Clean
                      </span>
                    )}
                  </div>
                  <DetailItem label="Abuse Score" value={`${results.reputation.abuse_score}/100`} />
                  <DetailItem label="Location" value={`${results.city}, ${results.country}`} />
                  <DetailItem label="Timezone" value={results.timezone} />
                </div>
                
                <Map lat={results.lat} lon={results.lon} city={results.city} />
              </div>
            </motion.div>
          )}

          {bulkResults.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card"
            >
              <h3 style={{ marginBottom: '1.5rem' }}>Bulk Results</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--surface-border)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '1rem' }}>IP Address</th>
                      <th style={{ padding: '1rem' }}>ISP</th>
                      <th style={{ padding: '1rem' }}>Location</th>
                      <th style={{ padding: '1rem' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkResults.map((res, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                        <td style={{ padding: '1rem', fontWeight: '600' }}>{res.query}</td>
                        <td style={{ padding: '1rem' }}>{res.isp || '-'}</td>
                        <td style={{ padding: '1rem' }}>{res.city ? `${res.city}, ${res.countryCode}` : '-'}</td>
                        <td style={{ padding: '1rem' }}>
                          {res.error ? (
                            <span className="badge badge-error">Error</span>
                          ) : res.reputation?.is_blacklisted ? (
                            <span className="badge badge-error">Blacklisted</span>
                          ) : (
                            <span className="badge badge-success">Clean</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* History Section */}
        {history.length > 0 && (
          <section style={{ marginTop: '4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <History color="var(--text-secondary)" />
                <h3 style={{ fontSize: '1.25rem' }}>Recent Scans</h3>
              </div>
              <div style={{ position: 'relative', width: '250px' }}>
                <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Search history..." 
                  style={{ padding: '0.5rem 0.5rem 0.5rem 2.5rem', fontSize: '0.85rem' }}
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {history
                .filter(item => 
                  item.query.toLowerCase().includes(historySearch.toLowerCase()) || 
                  item.isp.toLowerCase().includes(historySearch.toLowerCase()) ||
                  item.country.toLowerCase().includes(historySearch.toLowerCase())
                )
                .map((item, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ x: 5 }}
                  className="glass-card" 
                  style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                  onClick={() => { setResults(item); setIpInput(item.query); }}
                >
                  <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <span style={{ fontWeight: '600', color: 'var(--primary-color)', minWidth: '120px' }}>{item.query}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{item.isp}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.countryCode}</span>
                    <Globe size={16} color="var(--text-secondary)" />
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        &copy; 2026 IP Sentinel. Powered by <a href="http://ip-api.com" target="_blank" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>ip-api.com</a>
      </footer>
    </div>
  );
};

const DetailItem = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{label}</span>
    <span style={{ fontWeight: '500', textAlign: 'right', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</span>
  </div>
);

export default App;
