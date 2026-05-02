import React from 'react';
import { NavLink } from 'react-router-dom';
import { Users, BarChart3, LayoutDashboard } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/directory', icon: Users, label: 'Employee Directory' },
    { path: '/insights', icon: BarChart3, label: 'Salary Insights' },
  ];

  return (
    <aside style={{
      width: '280px',
      background: 'var(--sidebar-bg)',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      padding: '2rem 1.5rem',
      position: 'sticky',
      top: 0,
      height: '100vh'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem', padding: '0 0.5rem' }}>
        <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '0.75rem' }}>
          <BarChart3 size={24} />
        </div>
        <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Incubytes<span style={{ color: 'var(--primary)' }}>.</span></span>
      </div>

      <nav style={{ flex: 1 }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.875rem 1rem',
              borderRadius: '0.75rem',
              textDecoration: 'none',
              color: isActive ? 'white' : '#94a3b8',
              background: isActive ? 'var(--sidebar-hover)' : 'transparent',
              marginBottom: '0.5rem',
              transition: 'all 0.2s',
              fontWeight: isActive ? 600 : 500,
            })}
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>

    </aside>
  );
};

export default Sidebar;
