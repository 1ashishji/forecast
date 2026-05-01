import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Edit2, Trash2, Globe, Briefcase, DollarSign, X } from 'lucide-react';

const API_BASE = '/api/employees';

const Directory = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', job_title: '', country: '', salary: ''
  });

  useEffect(() => { fetchEmployees(); }, []);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(API_BASE);
      setEmployees(res.data.employees || []);
      setLoading(false);
    } catch (err) { console.error(err); setLoading(false); }
  };

  const handleOpenModal = (emp = null) => {
    if (emp) {
      setEditingEmployee(emp);
      setFormData({ ...emp });
    } else {
      setEditingEmployee(null);
      setFormData({ first_name: '', last_name: '', email: '', job_title: '', country: '', salary: '' });
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
      fetchEmployees();
    } catch (err) { alert(JSON.stringify(err.response?.data)); }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this employee record?')) {
      await axios.delete(`${API_BASE}/${id}`);
      fetchEmployees();
    }
  };

  const filteredEmployees = employees.filter(emp => 
    `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.job_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800 }}>Employee Directory</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage your global team and their records</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} /> Add Employee
        </button>
      </header>

      <div className="card" style={{ marginBottom: '2rem', padding: '1rem' }}>
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
          <input 
            style={{ paddingLeft: '3rem' }} 
            placeholder="Search by name, role or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Member</th>
                <th>Role & Location</th>
                <th>Salary</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map(emp => (
                <tr key={emp.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary)' }}>
                        {emp.first_name[0]}{emp.last_name[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700 }}>{emp.first_name} {emp.last_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <Briefcase size={14} color="var(--text-muted)" />
                      <span style={{ fontWeight: 600 }}>{emp.job_title}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <Globe size={14} /> {emp.country}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>
                      ${Number(emp.salary).toLocaleString()}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleOpenModal(emp)} className="btn" style={{ background: '#f1f5f9', color: 'var(--text-main)', padding: '0.5rem' }}><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(emp.id)} className="btn" style={{ background: '#fef2f2', color: 'var(--error)', padding: '0.5rem' }}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
          <div className="card animate-in" style={{ width: '100%', maxWidth: '600px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div><label>First Name</label><input value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} required /></div>
                <div><label>Last Name</label><input value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} required /></div>
              </div>
              <div style={{ marginTop: '1rem' }}><label>Email</label><input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div><label>Job Title</label><input value={formData.job_title} onChange={e => setFormData({...formData, job_title: e.target.value})} required /></div>
                <div><label>Country</label><input value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} required /></div>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <label>Annual Salary ($)</label>
                <div style={{ position: 'relative' }}>
                  <DollarSign size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input style={{ paddingLeft: '2.5rem' }} type="number" value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} required />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '1rem' }}>{editingEmployee ? 'Update Record' : 'Create Record'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn" style={{ flex: 1, background: '#f1f5f9' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Directory;
