import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { TrendingUp, Users, Globe, Target, DollarSign } from 'lucide-react';

const Insights = () => {
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('USA');
  const [jobTitles, setJobTitles] = useState([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [countryStats, setCountryStats] = useState(null);
  const [jobStats, setJobStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedCountry) fetchCountryStats(selectedCountry);
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedCountry && selectedJob) fetchJobStats(selectedCountry, selectedJob);
  }, [selectedCountry, selectedJob]);

  const fetchInitialData = async () => {
    try {
      const [countriesRes, jobsRes] = await Promise.all([
        axios.get('/api/v1/employees/countries'),
        axios.get('/api/v1/employees/job_titles')
      ]);

      const uniqueCountries = countriesRes.data || [];
      const uniqueJobs = jobsRes.data || [];
      
      setCountries(uniqueCountries);
      setJobTitles(uniqueJobs);
      
      if (uniqueCountries.length > 0) setSelectedCountry(uniqueCountries[0]);
      if (uniqueJobs.length > 0) setSelectedJob(uniqueJobs[0]);
      
      setLoading(false);
    } catch (err) { console.error(err); }
  };

  const fetchCountryStats = async (country) => {
    try {
      const res = await axios.get(`/api/v1/insights/salary_by_country?country=${country}`);
      setCountryStats(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchJobStats = async (country, job) => {
    try {
      const res = await axios.get(`/api/v1/insights/salary_by_job_title_and_country?country=${country}&job_title=${job}`);
      setJobStats(res.data);
    } catch (err) { console.error(err); }
  };

  if (loading) return <div>Loading insights...</div>;

  const distributionData = countryStats?.salary_distribution ?
    Object.entries(countryStats.salary_distribution).map(([name, value]) => ({ name, value })) : [];

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e'];

  return (
    <div className="animate-in">
      <header style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 800 }}>Salary Analytics</h1>
        <p style={{ color: 'var(--text-muted)' }}>Real-time compensation insights across regions and roles</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>Average Salary</span>
            <DollarSign size={20} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.5rem' }}>${Number(countryStats?.avg_salary || 0).toLocaleString()}</div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--success)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Employees</span>
            <Users size={20} color="var(--success)" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.5rem' }}>{countryStats?.employee_count || 0}</div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--warning)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>Median Salary</span>
            <Target size={20} color="var(--warning)" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.5rem' }}>${Number(countryStats?.median_salary || 0).toLocaleString()}</div>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--error)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>Role Average</span>
            <TrendingUp size={20} color="var(--error)" />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.5rem' }}>${Number(jobStats?.avg_salary || 0).toLocaleString()}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        <div className="card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '1.5rem' }}>Filter Insights</h2>
          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>SELECT COUNTRY</label>
          <select value={selectedCountry} onChange={(e) => setSelectedCountry(e.target.value)} style={{ marginBottom: '1.5rem' }}>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>SELECT JOB TITLE</label>
          <select value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)}>
            {jobTitles.map(j => <option key={j} value={j}>{j}</option>)}
          </select>

          <div style={{ marginTop: '2rem', background: 'var(--bg)', padding: '1.5rem', borderRadius: '1rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '1rem' }}>Regional Highlights</h3>
            <div style={{ fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Max Salary:</span> <span style={{ fontWeight: 700 }}>${Number(countryStats?.max_salary || 0).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Min Salary:</span> <span style={{ fontWeight: 700 }}>${Number(countryStats?.min_salary || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '1.5rem' }}>Salary Distribution</h2>
          <div style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  cursor={{ fill: 'var(--bg)' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Insights;
