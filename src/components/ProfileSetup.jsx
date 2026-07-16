import { useState } from 'react';
import { G } from '../lib/core.js';

export function ProfileSetup({ onProfileCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Manager'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim() && formData.email.trim()) {
      onProfileCreated(formData.name, formData.email, formData.role);
    }
  };

  const isValid = formData.name.trim() && formData.email.trim();

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #050403 0%, #0A0906 100%)',
        color: G.text
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl p-8 ezx-fade-in"
        style={{
          background: 'linear-gradient(180deg, #0F0D08, #0B0A06)',
          border: `1px solid ${G.border}`,
          boxShadow: '0 20px 60px rgba(0,0,0,0.8)'
        }}
      >
        <h1
          className="font-bold tracking-[0.08em] mb-2"
          style={{
            color: G.goldBright,
            fontSize: 28,
            textShadow: '0 0 18px rgba(245,200,66,0.35)'
          }}
        >
          Create Profile
        </h1>
        <p style={{ color: G.dim, fontSize: 13, marginBottom: 24, letterSpacing: '0.05em' }}>
          Set up your profile to get started
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field */}
          <div>
            <label
              style={{
                display: 'block',
                color: G.dim,
                fontSize: 11,
                letterSpacing: '0.15em',
                marginBottom: 8,
                fontWeight: 600
              }}
            >
              FULL NAME
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              style={{
                width: '100%',
                background: '#0A0906',
                border: `1px solid ${G.border}`,
                borderRadius: 8,
                padding: '12px 14px',
                color: G.text,
                fontSize: 13,
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => (e.target.style.borderColor = G.goldBright)}
              onBlur={(e) => (e.target.style.borderColor = G.border)}
            />
          </div>

          {/* Email Field */}
          <div>
            <label
              style={{
                display: 'block',
                color: G.dim,
                fontSize: 11,
                letterSpacing: '0.15em',
                marginBottom: 8,
                fontWeight: 600
              }}
            >
              EMAIL
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              style={{
                width: '100%',
                background: '#0A0906',
                border: `1px solid ${G.border}`,
                borderRadius: 8,
                padding: '12px 14px',
                color: G.text,
                fontSize: 13,
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => (e.target.style.borderColor = G.goldBright)}
              onBlur={(e) => (e.target.style.borderColor = G.border)}
            />
          </div>

          {/* Role Field */}
          <div>
            <label
              style={{
                display: 'block',
                color: G.dim,
                fontSize: 11,
                letterSpacing: '0.15em',
                marginBottom: 8,
                fontWeight: 600
              }}
            >
              ROLE
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={{
                width: '100%',
                background: '#0A0906',
                border: `1px solid ${G.border}`,
                borderRadius: 8,
                padding: '12px 14px',
                color: G.text,
                fontSize: 13,
                outline: 'none',
                transition: 'border-color 0.2s',
                cursor: 'pointer'
              }}
              onFocus={(e) => (e.target.style.borderColor = G.goldBright)}
              onBlur={(e) => (e.target.style.borderColor = G.border)}
            >
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Viewer">Viewer</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isValid}
            style={{
              width: '100%',
              background: isValid
                ? 'linear-gradient(180deg,#F5C842,#D4AF37)'
                : 'linear-gradient(180deg,#8B7F2F,#5D5220)',
              border: isValid ? '1px solid #F5C842' : '1px solid #5D5220',
              borderRadius: 8,
              padding: '14px 16px',
              color: isValid ? '#141105' : '#3D3A2A',
              cursor: isValid ? 'pointer' : 'not-allowed',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.15em',
              marginTop: 24,
              transition: 'all 0.2s',
              boxShadow: isValid ? '0 0 22px rgba(212,175,55,0.45)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (isValid) e.target.style.opacity = '0.95';
            }}
            onMouseLeave={(e) => {
              if (isValid) e.target.style.opacity = '1';
            }}
          >
            CREATE PROFILE
          </button>
        </form>

        <p
          style={{
            color: G.faint,
            fontSize: 11,
            textAlign: 'center',
            marginTop: 16,
            letterSpacing: '0.05em'
          }}
        >
          Required to access your dashboard
        </p>
      </div>
    </div>
  );
}
