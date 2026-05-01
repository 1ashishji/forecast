import React, { useState, useEffect } from 'react'
import axios from 'axios'

const API_BASE = '/api/employees'

function App() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    job_title: '',
    country: '',
    salary: ''
  })

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(API_BASE)
      // Standardize response handling for paginated results
      const data = res.data.employees || (Array.isArray(res.data) ? res.data : [])
      setEmployees(data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching employees', err)
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await axios.patch(`${API_BASE}/${editingId}`, { employee: formData })
      } else {
        await axios.post(API_BASE, { employee: formData })
      }
      setFormData({ first_name: '', last_name: '', email: '', job_title: '', country: '', salary: '' })
      setEditingId(null)
      fetchEmployees()
    } catch (err) {
      alert('Error saving employee: ' + JSON.stringify(err.response?.data))
    }
  }

  const handleEdit = (emp) => {
    setEditingId(emp.id)
    setFormData({
      first_name: emp.first_name,
      last_name: emp.last_name,
      email: emp.email,
      job_title: emp.job_title,
      country: emp.country,
      salary: emp.salary
    })
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return
    try {
      await axios.delete(`${API_BASE}/${id}`)
      fetchEmployees()
    } catch (err) {
      console.error('Error deleting employee', err)
    }
  }

  return (
    <div className="container">
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary)' }}>Employee Portal</h1>
        <p style={{ color: 'var(--text-light)' }}>Manage your global workforce with ease.</p>
      </header>

      <div className="card">
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--bg)', paddingBottom: '0.5rem' }}>
          {editingId ? 'Modify Employee Record' : 'Onboard New Employee'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>First Name</label>
              <input 
                placeholder="e.g. John" 
                value={formData.first_name} 
                onChange={e => setFormData({...formData, first_name: e.target.value})} 
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Last Name</label>
              <input 
                placeholder="e.g. Doe" 
                value={formData.last_name} 
                onChange={e => setFormData({...formData, last_name: e.target.value})} 
                required
              />
            </div>
          </div>
          
          <div style={{ marginTop: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Email Address</label>
            <input 
              placeholder="john.doe@company.com" 
              type="email"
              value={formData.email} 
              onChange={e => setFormData({...formData, email: e.target.value})} 
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginTop: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Job Title</label>
              <input 
                placeholder="e.g. Engineer" 
                value={formData.job_title} 
                onChange={e => setFormData({...formData, job_title: e.target.value})} 
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Country</label>
              <input 
                placeholder="e.g. USA" 
                value={formData.country} 
                onChange={e => setFormData({...formData, country: e.target.value})} 
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Salary ($)</label>
              <input 
                placeholder="0.00" 
                type="number"
                value={formData.salary} 
                onChange={e => setFormData({...formData, salary: e.target.value})} 
                required
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button type="submit" className="primary" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }}>
              {editingId ? 'Update Record' : 'Add to Directory'}
            </button>
            {editingId && (
              <button 
                type="button" 
                onClick={() => { setEditingId(null); setFormData({ first_name: '', last_name: '', email: '', job_title: '', country: '', salary: '' }) }}
                style={{ background: '#f1f5f9', color: '#64748b' }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card" style={{ padding: '0' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.25rem' }}>Employee Directory</h2>
          <span style={{ fontSize: '0.875rem', background: 'var(--bg)', padding: '0.25rem 0.75rem', borderRadius: '1rem', color: 'var(--text-light)' }}>
            {employees.length} Records found
          </span>
        </div>
        
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <div className="spinner" style={{ border: '4px solid #f3f3f3', borderTop: '4px solid var(--primary)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 2s linear infinite', margin: '0 auto' }}></div>
            <p style={{ marginTop: '1rem', color: 'var(--text-light)' }}>Syncing with server...</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Full Name</th>
                  <th>Job Title</th>
                  <th>Country</th>
                  <th>Salary</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light)' }}>No employees found. Start by onboarding someone!</td>
                  </tr>
                ) : (
                  employees.map(emp => (
                    <tr key={emp.id} style={{ transition: 'background 0.2s' }} onMouseOver={e => e.currentTarget.style.background = '#f8fafc'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ fontWeight: '500' }}>
                        <div>{emp.first_name} {emp.last_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: '400' }}>{emp.email}</div>
                      </td>
                      <td>{emp.job_title}</td>
                      <td>
                        <span style={{ background: '#ecfdf5', color: '#059669', padding: '0.2rem 0.6rem', borderRadius: '0.4rem', fontSize: '0.875rem' }}>
                          {emp.country}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontWeight: '600' }}>${Number(emp.salary).toLocaleString()}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button onClick={() => handleEdit(emp)} style={{ marginRight: '0.5rem', background: '#f1f5f9', color: 'var(--primary)' }}>Edit</button>
                        <button onClick={() => handleDelete(emp.id)} style={{ background: '#fef2f2', color: 'var(--error)' }}>Delete</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default App
