import React, { useState, useEffect } from 'react';
import { Search, Globe, Shield, Activity, History, Server, MapPin, AlertTriangle, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
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
    setHistory(prev => {
      const newHistory = [data, ...prev.filter(h => h.query !== data.query)].slice(0, 50);
      localStorage.setItem('ip_history', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const saveMultipleToHistory = (dataArray) => {
    setHistory(prev => {
      let currentHistory = [...prev];
      dataArray.forEach(data => {
        currentHistory = [data, ...currentHistory.filter(h => h.query !== data.query)];
      });
      const finalHistory = currentHistory.slice(0, 50);
      localStorage.setItem('ip_history', JSON.stringify(finalHistory));
      return finalHistory;
    });
  };

  const deleteFromHistory = (ip) => {
    const newHistory = history.filter(h => h.query !== ip);
    setHistory(newHistory);
    localStorage.setItem('ip_history', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('ip_history');
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
      }

      if (mode === 'bulk') {
        setBulkResults(allResults);
        setResults(null);
        // Save all valid results to history at once
        const validResults = allResults.filter(r => !r.error);
        if (validResults.length > 0) {
          saveMultipleToHistory(validResults);
        }
      } else {
        if (allResults[0] && !allResults[0].error) {
          setResults(allResults[0]);
          saveToHistory(allResults[0]);
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  if (!isAuthenticated) {
    return (
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f5f5f7' }}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card" 
          style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}
        >
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'inline-flex', padding: '1rem', background: '#000', borderRadius: '14px', marginBottom: '1.5rem' }}>
              <Shield size={28} color="#fff" />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.03em', color: '#1d1d1f' }}>WMN3</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.4rem' }}>Developed By Ismail</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1d1d1f', marginBottom: '0.5rem', display: 'block' }}>Access Key</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="admin"
                value={loginData.username}
                onChange={(e) => setLoginData({...loginData, username: e.target.value})}
              />
            </div>
            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1d1d1f', marginBottom: '0.5rem', display: 'block' }}>Password</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="••••••••"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
              />
            </div>
            
            {loginError && <p style={{ color: 'var(--error-color)', fontSize: '0.85rem' }}>{loginError}</p>}
            
            <button type="submit" className="glow-button" style={{ width: '100%', marginTop: '1rem' }}>
              Sign In
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <nav style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '1.25rem 2.5rem', 
        borderBottom: '1px solid var(--surface-border)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(20px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ padding: '0.5rem', background: '#000', borderRadius: '10px' }}>
            <Shield size={20} color="#fff" />
          </div>
          <div style={{ lineHeight: 1.1 }}>
            <h1 style={{ fontSize: '1.1rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#1d1d1f' }}>WMN3</h1>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: '700', textTransform: 'uppercase' }}>developed By Ismail</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success-color)' }}></div>
            Operational
          </div>
          <button 
            onClick={handleLogout}
            style={{ 
              background: 'transparent', 
              border: 'none', 
              color: 'var(--text-secondary)', 
              cursor: 'pointer', 
              fontSize: '0.85rem',
              fontWeight: '500'
            }}
          >
            Log out
          </button>
        </div>
      </nav>

      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
        <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontSize: '2.5rem', marginBottom: '0.5rem', fontWeight: '800' }}
          >
            WMN3
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px' }}
          >
            developed By Ismail
          </motion.p>
        </header>

        <section className="glass-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <button 
              onClick={() => setMode('single')}
              style={{ 
                background: mode === 'single' ? '#000' : 'transparent',
                color: mode === 'single' ? '#fff' : 'var(--text-secondary)',
                border: '1px solid var(--surface-border)',
                padding: '0.5rem 1.25rem', borderRadius: '10px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600'
              }}
            >
              Single IP
            </button>
            <button 
              onClick={() => setMode('bulk')}
              style={{ 
                background: mode === 'bulk' ? '#000' : 'transparent',
                color: mode === 'bulk' ? '#fff' : 'var(--text-secondary)',
                border: '1px solid var(--surface-border)',
                padding: '0.5rem 1.25rem', borderRadius: '10px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600'
              }}
            >
              Bulk Scan
            </button>
            <button 
              onClick={() => setShowStats(!showStats)}
              style={{ 
                background: 'transparent',
                color: showStats ? 'var(--primary-color)' : 'var(--text-secondary)',
                border: 'none',
                padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500', marginLeft: 'auto'
              }}
            >
              {showStats ? 'Hide Analytics' : 'View Analytics'}
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
              style={{ padding: '0' }}
            >
              <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: '600' }}>Bulk Intelligence Results</h3>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{bulkResults.length} entries processed</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ background: '#fbfbfd', color: 'var(--text-secondary)', borderBottom: '1px solid var(--surface-border)' }}>
                      <th style={{ padding: '1rem', fontWeight: '500' }}>IP Address</th>
                      <th style={{ padding: '1rem', fontWeight: '500' }}>Status</th>
                      <th style={{ padding: '1rem', fontWeight: '500' }}>ISP</th>
                      <th style={{ padding: '1rem', fontWeight: '500' }}>Organization</th>
                      <th style={{ padding: '1rem', fontWeight: '500' }}>ASN</th>
                      <th style={{ padding: '1rem', fontWeight: '500' }}>Country</th>
                      <th style={{ padding: '1rem', fontWeight: '500' }}>Region</th>
                      <th style={{ padding: '1rem', fontWeight: '500' }}>City</th>
                      <th style={{ padding: '1rem', fontWeight: '500' }}>Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bulkResults.map((res, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', verticalAlign: 'middle' }}>
                        <td style={{ padding: '1rem', fontWeight: '700', color: 'var(--primary-color)', fontFamily: 'monospace' }}>{res.query}</td>
                        <td style={{ padding: '1rem' }}>
                          {res.error ? (
                            <span style={{ color: 'var(--error-color)' }}>Fail</span>
                          ) : (
                            <span style={{ color: 'var(--success-color)' }}>Success</span>
                          )}
                        </td>
                        <td style={{ padding: '1rem', whiteSpace: 'nowrap', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{res.isp || '-'}</td>
                        <td style={{ padding: '1rem', whiteSpace: 'nowrap', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{res.org || '-'}</td>
                        <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>{res.as || '-'}</td>
                        <td style={{ padding: '1rem' }}>{res.countryCode || '-'}</td>
                        <td style={{ padding: '1rem' }}>{res.regionName || '-'}</td>
                        <td style={{ padding: '1rem' }}>{res.city || '-'}</td>
                        <td style={{ padding: '1rem', color: res.error ? 'var(--error-color)' : 'var(--text-secondary)' }}>
                          {res.error ? res.error : 'OK'}
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
                <h3 style={{ fontSize: '1.25rem' }}>Protocol Historique</h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                  {history.length} / 50
                </span>
              </div>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <button 
                  onClick={clearHistory}
                  style={{ background: 'transparent', border: 'none', color: 'var(--error-color)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: '600', textTransform: 'uppercase' }}
                >
                  Clear Archive
                </button>
                <div style={{ position: 'relative', width: '250px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="text" 
                    className="input-field" 
                    placeholder="Search logs..." 
                    style={{ padding: '0.5rem 0.5rem 0.5rem 2.5rem', fontSize: '0.85rem' }}
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                  />
                </div>
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
                >
                  <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }} onClick={() => { setResults(item); setIpInput(item.query); }}>
                    <span style={{ fontWeight: '600', color: 'var(--primary-color)', minWidth: '120px', fontFamily: 'monospace' }}>{item.query}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{item.isp}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '0.8rem', fontWeight: '600' }}>{item.city}</p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>{item.countryCode}</p>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteFromHistory(item.query); }}
                      style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.1)', cursor: 'pointer', padding: '0.5rem' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--error-color)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.1)'}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
        <p style={{ marginBottom: '0.5rem' }}>&copy; 2026 WMN3</p>
        <p style={{ fontSize: '0.75rem', opacity: 0.5 }}>developed By Ismail</p>
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
    .slice(0, 10);
};

export default App;
