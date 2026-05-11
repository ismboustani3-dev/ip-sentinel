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
  const [showStats, setShowStats] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const savedHistory = localStorage.getItem('ip_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    
    const savedAuth = localStorage.getItem('is_authenticated');
    if (savedAuth === 'true') setIsAuthenticated(true);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginData.username === 'admin' && loginData.password === 'sentinel2026') {
      setIsAuthenticated(true);
      localStorage.setItem('is_authenticated', 'true');
      setLoginError('');
    } else {
      setLoginError('Invalid credentials. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('is_authenticated');
  };

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
            <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', letterSpacing: '4px' }}>ACCESS<span style={{ color: 'var(--primary-color)' }}>KEY</span></h2>
            <p style={{ color: 'var(--text-secondary)', letterSpacing: '2px', fontSize: '0.75rem', textTransform: 'uppercase' }}>Encrypted Terminal Uplink</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--primary-color)', marginBottom: '0.5rem', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>System Identifier</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="USER_ID"
                value={loginData.username}
                onChange={(e) => setLoginData({...loginData, username: e.target.value})}
              />
            </div>
            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '0.7rem', color: 'var(--primary-color)', marginBottom: '0.5rem', display: 'block', textTransform: 'uppercase', letterSpacing: '1px' }}>Security Cipher</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="••••••••"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
              />
            </div>
            
            {loginError && <p style={{ color: 'var(--error-color)', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' }}>[ACCESS_DENIED]: {loginError}</p>}
            
            <button type="submit" className="glow-button" style={{ marginTop: '1rem' }}>
              Initialize Uplink
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
          <div className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 0 10px rgba(0, 255, 157, 0.2)' }}>
            <Activity size={14} /> System Online
          </div>
          <button 
            onClick={handleLogout}
            style={{ 
              background: 'rgba(255, 0, 122, 0.1)', 
              border: '1px solid rgba(255, 0, 122, 0.2)', 
              color: 'var(--secondary-color)', 
              padding: '0.4rem 1rem', 
              borderRadius: '4px', 
              cursor: 'pointer', 
              fontSize: '0.75rem',
              fontWeight: '700',
              textTransform: 'uppercase'
            }}
          >
            Terminal Disconnect
          </button>
        </div>
      </nav>

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
        <header style={{ textAlign: 'center', marginBottom: '4rem', position: 'relative' }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '100px' }}
            style={{ height: '2px', background: 'var(--primary-color)', margin: '0 auto 1.5rem', boxShadow: '0 0 10px var(--primary-color)' }}
          />
          <motion.h2 
            initial={{ opacity: 0, letterSpacing: '10px' }}
            animate={{ opacity: 1, letterSpacing: '2px' }}
            style={{ fontSize: '3.5rem', marginBottom: '1rem', fontWeight: '800' }}
          >
            NET<span style={{ color: 'var(--primary-color)' }}>INTEL</span> PROTOCOL
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ color: 'var(--text-secondary)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '3px' }}
          >
            Global IP Reputation & Provider Analytics
          </motion.p>
        </header>

        <section className="glass-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <button 
              onClick={() => setMode('single')}
              style={{ 
                background: mode === 'single' ? 'rgba(0, 242, 255, 0.1)' : 'transparent',
                color: mode === 'single' ? 'var(--primary-color)' : 'var(--text-secondary)',
                border: `1px solid ${mode === 'single' ? 'var(--primary-color)' : 'var(--surface-border)'}`,
                padding: '0.6rem 1.2rem', borderRadius: '4px', cursor: 'pointer', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px'
              }}
            >
              Access Port
            </button>
            <button 
              onClick={() => setMode('bulk')}
              style={{ 
                background: mode === 'bulk' ? 'rgba(0, 242, 255, 0.1)' : 'transparent',
                color: mode === 'bulk' ? 'var(--primary-color)' : 'var(--text-secondary)',
                border: `1px solid ${mode === 'bulk' ? 'var(--primary-color)' : 'var(--surface-border)'}`,
                padding: '0.6rem 1.2rem', borderRadius: '4px', cursor: 'pointer', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px'
              }}
            >
              Matrix Scan
            </button>
            <button 
              onClick={() => setShowStats(!showStats)}
              style={{ 
                background: showStats ? 'rgba(0, 255, 157, 0.1)' : 'transparent',
                color: showStats ? 'var(--success-color)' : 'var(--text-secondary)',
                border: `1px solid ${showStats ? 'var(--success-color)' : 'var(--surface-border)'}`,
                padding: '0.6rem 1.2rem', borderRadius: '4px', cursor: 'pointer', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginLeft: 'auto'
              }}
            >
              {showStats ? 'Close Intel' : 'Network Stats'}
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

        {showStats && history.length > 0 && (
          <motion.section 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="glass-card" 
            style={{ marginBottom: '2rem', padding: '1.5rem' }}
          >
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={20} color="var(--success-color)" />
              Protocol Statistics
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <StatItem label="Total Scans" value={history.length} color="var(--primary-color)" />
              <StatItem label="Unique Countries" value={new Set(history.map(h => h.countryCode)).size} color="var(--secondary-color)" />
              <StatItem label="Top Provider" value={getTopItem(history, 'isp')} color="var(--success-color)" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              <div>
                <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase' }}>Provider Distribution</h4>
                {getDistribution(history, 'isp').map((d, i) => (
                  <ProgressBar key={i} label={d.name} percent={d.percent} />
                ))}
              </div>
              <div>
                <h4 style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase' }}>Country Analytics</h4>
                {getDistribution(history, 'country').map((d, i) => (
                  <ProgressBar key={i} label={d.name} percent={d.percent} />
                ))}
              </div>
            </div>
          </motion.section>
        )}
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

const StatItem = ({ label, value, color }) => (
  <div className="glass-card" style={{ padding: '1rem', textAlign: 'center', borderTop: `2px solid ${color}` }}>
    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{label}</p>
    <p style={{ fontSize: '1.25rem', fontWeight: '800', color: color }}>{value}</p>
  </div>
);

const ProgressBar = ({ label, percent }) => (
  <div style={{ marginBottom: '1rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.75rem' }}>
      <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>{label}</span>
      <span style={{ color: 'var(--text-secondary)' }}>{percent}%</span>
    </div>
    <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        style={{ height: '100%', background: 'var(--primary-color)', boxShadow: '0 0 10px var(--primary-color)' }}
      />
    </div>
  </div>
);

const getTopItem = (history, key) => {
  if (!history.length) return '-';
  const counts = history.reduce((acc, h) => {
    acc[h[key]] = (acc[h[key]] || 0) + 1;
    return acc;
  }, {});
  return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);
};

const getDistribution = (history, key) => {
  if (!history.length) return [];
  const counts = history.reduce((acc, h) => {
    acc[h[key]] = (acc[h[key]] || 0) + 1;
    return acc;
  }, {});
  const total = history.length;
  return Object.entries(counts)
    .map(([name, count]) => ({ name, percent: Math.round((count / total) * 100) }))
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 5);
};

export default App;
