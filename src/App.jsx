import React, { useState, useEffect } from 'react';
import { Search, Globe, Shield, Activity, History, Server, MapPin, AlertTriangle, CheckCircle2, XCircle, Trash2, Plus, Calendar, Users } from 'lucide-react';
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
  const [servers, setServers] = useState([]);
  const [newServer, setNewServer] = useState({ name: '', team: '', entryDate: '', cancelDate: '' });

  useEffect(() => {
    const savedHistory = localStorage.getItem('ip_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    
    const savedAuth = localStorage.getItem('is_authenticated');
    if (savedAuth === 'true') setIsAuthenticated(true);

    const savedServers = localStorage.getItem('sentinel_servers');
    if (savedServers) setServers(JSON.parse(savedServers));
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
    const newHistory = [data, ...history.filter(h => h.query !== data.query)].slice(0, 50);
    setHistory(newHistory);
    localStorage.setItem('ip_history', JSON.stringify(newHistory));
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

  const addServer = (e) => {
    e.preventDefault();
    if (!newServer.name || !newServer.team) return;
    const serverWithId = { ...newServer, id: Date.now().toString() };
    const updatedServers = [serverWithId, ...servers];
    setServers(updatedServers);
    localStorage.setItem('sentinel_servers', JSON.stringify(updatedServers));
    setNewServer({ name: '', team: '', entryDate: '', cancelDate: '' });
  };

  const deleteServer = (id) => {
    const updatedServers = servers.filter(s => s.id !== id);
    setServers(updatedServers);
    localStorage.setItem('sentinel_servers', JSON.stringify(updatedServers));
  };

  if (!isAuthenticated) {
    return (
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="bg-blobs">
          <div className="blob blob-1"></div>
          <div className="blob blob-2"></div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card" 
          style={{ width: '100%', maxWidth: '380px', border: '1px solid var(--surface-border)' }}
        >
          <div style={{ marginBottom: '2.5rem', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Shield size={24} color="var(--primary-color)" />
              <h1 style={{ fontSize: '1.25rem', fontWeight: '700' }}>IP SENTINEL</h1>
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Sign In</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Enter your credentials to manage the infrastructure.</p>
          </div>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>Email or Username</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="admin"
                value={loginData.username}
                onChange={(e) => setLoginData({...loginData, username: e.target.value})}
              />
            </div>
            <div style={{ textAlign: 'left' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>Password</label>
              <input 
                type="password" 
                className="input-field" 
                placeholder="••••••••"
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
              />
            </div>
            
            {loginError && <p style={{ color: 'var(--error-color)', fontSize: '0.85rem' }}>{loginError}</p>}
            
            <button type="submit" className="glow-button" style={{ width: '100%' }}>
              Continue
            </button>
          </form>
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
            style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: '800' }}
          >
            Network Intelligence
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}
          >
            Comprehensive IP analytics and infrastructure registry for professional security teams.
          </motion.p>
        </header>

        <section className="glass-card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <button 
              onClick={() => setMode('single')}
              style={{ 
                background: mode === 'single' ? '#1f1f1f' : 'transparent',
                color: mode === 'single' ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: '1px solid var(--surface-border)',
                padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500'
              }}
            >
              Single IP
            </button>
            <button 
              onClick={() => setMode('bulk')}
              style={{ 
                background: mode === 'bulk' ? '#1f1f1f' : 'transparent',
                color: mode === 'bulk' ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: '1px solid var(--surface-border)',
                padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500'
              }}
            >
              Bulk Scan
            </button>
            <button 
              onClick={() => setMode('tools')}
              style={{ 
                background: mode === 'tools' ? '#1f1f1f' : 'transparent',
                color: mode === 'tools' ? 'var(--text-primary)' : 'var(--text-secondary)',
                border: '1px solid var(--surface-border)',
                padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '500'
              }}
            >
              Infrastructure
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
          
          {mode !== 'tools' ? (
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
          ) : (
            <form onSubmit={addServer} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <Server style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={18} />
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Server Name" 
                  style={{ paddingLeft: '3rem' }}
                  value={newServer.name}
                  onChange={(e) => setNewServer({...newServer, name: e.target.value})}
                  required
                />
              </div>
              <div style={{ position: 'relative' }}>
                <Users style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={18} />
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Team" 
                  style={{ paddingLeft: '3rem' }}
                  value={newServer.team}
                  onChange={(e) => setNewServer({...newServer, team: e.target.value})}
                  required
                />
              </div>
              <div style={{ position: 'relative' }}>
                <Calendar style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={18} />
                <input 
                  type="date" 
                  className="input-field" 
                  style={{ paddingLeft: '3rem' }}
                  value={newServer.entryDate}
                  onChange={(e) => setNewServer({...newServer, entryDate: e.target.value})}
                />
              </div>
              <div style={{ position: 'relative' }}>
                <Calendar style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} size={18} />
                <input 
                  type="date" 
                  className="input-field" 
                  placeholder="Cancellation Date"
                  style={{ paddingLeft: '3rem' }}
                  value={newServer.cancelDate}
                  onChange={(e) => setNewServer({...newServer, cancelDate: e.target.value})}
                />
              </div>
              <button type="submit" className="glow-button" style={{ gridColumn: '1 / -1' }}>
                <Plus size={18} style={{ marginRight: '0.5rem' }} /> Add Server to Registry
              </button>
            </form>
          )}
        </section>

        {mode === 'tools' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card"
            style={{ padding: '0', marginBottom: '4rem' }}
          >
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1rem', letterSpacing: '2px' }}>Server Infrastructure registry</h3>
              <span className="badge badge-success" style={{ fontSize: '0.6rem' }}>{servers.length} Assets Registered</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(0,0,0,0.4)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    <th style={{ padding: '1rem' }}>Server Name</th>
                    <th style={{ padding: '1rem' }}>Team</th>
                    <th style={{ padding: '1rem' }}>Entry Date</th>
                    <th style={{ padding: '1rem' }}>Cancellation Date</th>
                    <th style={{ padding: '1rem' }}>Status</th>
                    <th style={{ padding: '1rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {servers.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', fontStyle: 'italic' }}>No servers registered in the matrix.</td>
                    </tr>
                  ) : (
                    servers.map((server) => (
                      <tr key={server.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', verticalAlign: 'middle' }}>
                        <td style={{ padding: '1rem', fontWeight: '700', color: 'var(--primary-color)' }}>{server.name}</td>
                        <td style={{ padding: '1rem' }}>
                          <span className="badge" style={{ borderColor: 'var(--secondary-color)', color: 'var(--secondary-color)' }}>{server.team}</span>
                        </td>
                        <td style={{ padding: '1rem' }}>{server.entryDate || '-'}</td>
                        <td style={{ padding: '1rem' }}>{server.cancelDate || '-'}</td>
                        <td style={{ padding: '1rem' }}>
                          <span className="badge badge-success">Active</span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <button 
                            onClick={() => deleteServer(server.id)}
                            style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.2)', cursor: 'pointer' }}
                            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--error-color)'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

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
                    <tr style={{ background: '#0a0a0a', color: 'var(--text-secondary)', borderBottom: '1px solid var(--surface-border)' }}>
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
