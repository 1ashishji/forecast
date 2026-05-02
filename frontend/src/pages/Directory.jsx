import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Search, Plus, Edit2, Trash2, Globe, Briefcase, DollarSign, X, ChevronLeft, ChevronRight, ChevronsLeft } from 'lucide-react';

const API_BASE = '/api/v1/employees';
const PAGE_SIZE = 20;

const Directory = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '', job_title: '', country: '', salary: '', currency: 'USD'
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [cursorHistory, setCursorHistory] = useState([null]); // index = page-1, value = cursor to use
  const [hasMore, setHasMore] = useState(false);
  const [totalLoaded, setTotalLoaded] = useState(0);

  const fetchEmployees = useCallback(async (cursor = null, page = 1) => {
    page === 1 ? setLoading(true) : setPageLoading(true);
    try {
      const params = new URLSearchParams({ limit: PAGE_SIZE });
      if (cursor) params.append('cursor', cursor);
      const res = await axios.get(`${API_BASE}?${params}`);
      const list = res.data.data || res.data.employees || [];
      const meta = res.data.meta || {};
      const nextCursor = meta.next_cursor ?? res.data.next_cursor ?? null;
      const more = meta.has_more ?? (nextCursor !== null);

      setEmployees(list);
      setHasMore(more);
      setCurrentPage(page);

      // Store next cursor for this page so we can navigate forward
      setCursorHistory(prev => {
        const updated = [...prev];
        updated[page] = nextCursor; // page index stores cursor to get page+1
        return updated;
      });

      // Track rough total
      setTotalLoaded(prev => Math.max(prev, (page - 1) * PAGE_SIZE + list.length + (more ? 1 : 0)));
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    } finally {
      setLoading(false);
      setPageLoading(false);
    }
  }, []);

  useEffect(() => { fetchEmployees(null, 1); }, [fetchEmployees]);

  const goToPage = (page) => {
    if (page < 1) return;
    const cursor = cursorHistory[page - 1] ?? null;
    fetchEmployees(cursor, page);
  };

  const handleOpenModal = (emp = null) => {
    if (emp) {
      setEditingEmployee(emp);
      setFormData({
        full_name: emp.full_name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim(),
        job_title: emp.job_title || '',
        country: emp.country || '',
        salary: emp.salary || '',
        currency: emp.currency || 'USD'
      });
    } else {
      setEditingEmployee(null);
      setFormData({ full_name: '', job_title: '', country: '', salary: '', currency: 'USD' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEmployee) {
        await axios.patch(`${API_BASE}/${editingEmployee.id}`, { employee: formData });
      } else {
        await axios.post(API_BASE, { employee: formData });
      }
      setShowModal(false);
      fetchEmployees(cursorHistory[currentPage - 1], currentPage);
    } catch (err) {
      alert(JSON.stringify(err.response?.data));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this employee record?')) {
      await axios.delete(`${API_BASE}/${id}`);
      fetchEmployees(cursorHistory[currentPage - 1], currentPage);
    }
  };

  const getInitials = (emp) => {
    const name = emp.full_name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim();
    const parts = name.split(' ').filter(Boolean);
    return parts.length >= 2 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : (name.slice(0, 2) || '??');
  };

  const getDisplayName = (emp) =>
    emp.full_name || `${emp.first_name || ''} ${emp.last_name || ''}`.trim();

  const filteredEmployees = employees.filter(emp => {
    const term = searchTerm.toLowerCase();
    return (
      getDisplayName(emp).toLowerCase().includes(term) ||
      (emp.job_title || '').toLowerCase().includes(term) ||
      (emp.country || '').toLowerCase().includes(term)
    );
  });

  const avatarColors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];
  const getAvatarColor = (id) => avatarColors[(id || 0) % avatarColors.length];

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ width: '48px', height: '48px', border: '4px solid #e2e8f0', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Loading employees...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const startRecord = (currentPage - 1) * PAGE_SIZE + 1;
  const endRecord = (currentPage - 1) * PAGE_SIZE + employees.length;
  const canGoPrev = currentPage > 1;
  const canGoNext = hasMore;

  return (
    <div className="animate-in">
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .page-btn { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 8px; border: 1px solid var(--border); background: white; cursor: pointer; font-size: 0.875rem; font-weight: 600; color: var(--text-main); transition: all 0.15s; }
        .page-btn:hover:not(:disabled) { background: var(--primary); color: white; border-color: var(--primary); }
        .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .page-btn.active { background: var(--primary); color: white; border-color: var(--primary); }
      `}</style>

      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800 }}>Employee Directory</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            {totalLoaded > 0
              ? `Showing ${startRecord}–${endRecord} of ${totalLoaded}${hasMore ? '+' : ''} records`
              : 'Manage your global team'}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Add Employee
        </button>
      </header>

      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
          <input
            style={{ paddingLeft: '3rem' }}
            placeholder="Search current page by name, role or country..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden', opacity: pageLoading ? 0.6 : 1, transition: 'opacity 0.2s' }}>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Role & Location</th>
                <th>Salary</th>
                <th>Currency</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔍</div>
                    No employees found
                  </td>
                </tr>
              ) : filteredEmployees.map(emp => (
                <tr key={emp.id} style={{ transition: 'background 0.15s' }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                      <div style={{
                        width: '42px', height: '42px', borderRadius: '50%',
                        background: getAvatarColor(emp.id),
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, color: 'white', fontSize: '0.8rem', flexShrink: 0,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}>
                        {getInitials(emp)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{getDisplayName(emp)}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '1px' }}>ID #{emp.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <Briefcase size={13} color="var(--text-muted)" />
                      <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{emp.job_title}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <Globe size={13} /> {emp.country}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>
                      ${Number(emp.salary).toLocaleString()}
                    </div>
                  </td>
                  <td>
                    <span style={{
                      background: 'var(--primary-glow)', color: 'var(--primary)',
                      padding: '0.25rem 0.625rem', borderRadius: '999px',
                      fontSize: '0.75rem', fontWeight: 700
                    }}>
                      {emp.currency || 'USD'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleOpenModal(emp)} className="btn" style={{ background: '#f1f5f9', color: 'var(--text-main)', padding: '0.5rem' }}>
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => handleDelete(emp.id)} className="btn" style={{ background: '#fef2f2', color: 'var(--error)', padding: '0.5rem' }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1.25rem 1.5rem', borderTop: '1px solid var(--border)',
          background: '#fafbfc'
        }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {pageLoading ? 'Loading...' : `Page ${currentPage} · ${employees.length} records`}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              className="page-btn"
              disabled={!canGoPrev || pageLoading}
              onClick={() => goToPage(1)}
              title="First page"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              className="page-btn"
              disabled={!canGoPrev || pageLoading}
              onClick={() => goToPage(currentPage - 1)}
              title="Previous page"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Page number indicators */}
            {[...Array(Math.max(currentPage, 1))].map((_, i) => {
              const page = i + 1;
              // Show first, last few, and pages around current
              const show = page === 1 || page === currentPage || Math.abs(page - currentPage) <= 1;
              if (!show) {
                if (page === 2 && currentPage > 3) return <span key={page} style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>…</span>;
                return null;
              }
              return (
                <button
                  key={page}
                  className={`page-btn${page === currentPage ? ' active' : ''}`}
                  onClick={() => goToPage(page)}
                  disabled={pageLoading}
                >
                  {page}
                </button>
              );
            })}
            {hasMore && <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>…</span>}

            <button
              className="page-btn"
              disabled={!canGoNext || pageLoading}
              onClick={() => goToPage(currentPage + 1)}
              title="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {startRecord}–{endRecord} of {totalLoaded}{hasMore ? '+' : ''}
          </div>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div className="card animate-in" style={{ width: '100%', maxWidth: '560px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>FULL NAME</label>
                <input value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} required placeholder="e.g. Jane Doe" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>JOB TITLE</label>
                  <input value={formData.job_title} onChange={e => setFormData({ ...formData, job_title: e.target.value })} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>COUNTRY (ISO)</label>
                  <input placeholder="e.g. US, IN, GB" value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value.toUpperCase().slice(0, 2) })} required maxLength={2} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>ANNUAL SALARY</label>
                  <div style={{ position: 'relative' }}>
                    <DollarSign size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input style={{ paddingLeft: '2.5rem' }} type="number" value={formData.salary} onChange={e => setFormData({ ...formData, salary: e.target.value })} required />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, fontSize: '0.8rem', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>CURRENCY</label>
                  <input placeholder="USD" value={formData.currency} onChange={e => setFormData({ ...formData, currency: e.target.value.toUpperCase().slice(0, 3) })} maxLength={3} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.875rem' }}>{editingEmployee ? 'Update Record' : 'Create Record'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn" style={{ flex: 1, background: '#f1f5f9', padding: '0.875rem' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Directory;
