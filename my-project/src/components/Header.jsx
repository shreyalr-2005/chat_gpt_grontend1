import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

const Header = () => {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('access_token');
  const userEmail = localStorage.getItem('user_email');

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_email');
    navigate('/login');
  };

  return (
    <div>
      <nav style={{ padding: '1rem', backgroundColor: '#333', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <Link to="/" style={{ color: 'white', marginRight: '1rem' }}>Home</Link>
          <Link to="/about" style={{ color: 'white', marginRight: '1rem' }}>About</Link>
          <Link to="/contact" style={{ color: 'white', marginRight: '1rem' }}>Contact</Link>
          <Link to="/dashboard" style={{ color: '#a5b4fc', marginRight: '1rem', fontWeight: '600' }}>Dashboard</Link>
          {!isLoggedIn && (
            <>
              <Link to="/login" style={{ color: 'white', marginRight: '1rem' }}>Login</Link>
              <Link to="/signup" style={{ color: 'white', marginRight: '1rem' }}>Signup</Link>
            </>
          )}
        </div>
        {isLoggedIn && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: '#ccc', fontSize: '0.85rem' }}>{userEmail}</span>
            <button
              onClick={handleLogout}
              style={{
                color: 'white',
                backgroundColor: '#dc2626',
                border: 'none',
                padding: '0.4rem 1rem',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              Logout
            </button>
          </div>
        )}
      </nav>
    </div>
  )
}

export default Header