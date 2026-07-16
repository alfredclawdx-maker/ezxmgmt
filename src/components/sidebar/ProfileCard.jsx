import { useState } from 'react';
import { ChevronDown, Pencil } from 'lucide-react';
import { G } from '../../lib/core.js';

export function ProfileCard({ profile, onEditProfile }) {
  const [showEdit, setShowEdit] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    role: profile?.role || 'Manager'
  });

  const handleSave = () => {
    onEditProfile(formData.name, formData.email, formData.role);
    setShowEdit(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <button
        onClick={() => setShowEdit(true)}
        className="flex items-center gap-2.5 px-2 py-2.5 rounded-lg transition-opacity hover:opacity-80 text-left w-full"
        style={{ border: `1px solid ${G.borderSoft}` }}
      >
        <span
          className="w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0"
          style={{
            background: '#1A1710',
            border: `1px solid ${G.border}`,
            color: G.goldBright,
            fontSize: 11
          }}
        >
          {profile?.name?.slice(0, 2).toUpperCase() || 'PR'}
        </span>
        <span className="min-w-0">
          <span className="block font-semibold truncate" style={{ color: G.text, fontSize: 12 }}>
            {profile?.name || 'Add Profile'}
          </span>
          <span className="block" style={{ color: G.faint, fontSize: 9.5, letterSpacing: '0.2em' }}>
            {profile?.role || 'SETUP'}
          </span>
        </span>
        <ChevronDown className="w-4 h-4 ml-auto shrink-0" style={{ color: G.dim }} />
      </button>

      {showEdit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setShowEdit(false)}
        >
          <div
            className="bg-gray-900 border rounded-xl p-6 w-full max-w-sm"
            style={{ border: `1px solid ${G.border}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ color: G.goldBright, fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
              Edit Profile
            </h2>

            <div className="space-y-4">
              <div>
                <label style={{ color: G.dim, fontSize: 12, letterSpacing: '0.1em' }}>Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  style={{
                    width: '100%',
                    background: '#0A0906',
                    border: `1px solid ${G.border}`,
                    borderRadius: 8,
                    padding: '10px 12px',
                    color: G.text,
                    fontSize: 13,
                    outline: 'none',
                    marginTop: 6
                  }}
                />
              </div>

              <div>
                <label style={{ color: G.dim, fontSize: 12, letterSpacing: '0.1em' }}>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  style={{
                    width: '100%',
                    background: '#0A0906',
                    border: `1px solid ${G.border}`,
                    borderRadius: 8,
                    padding: '10px 12px',
                    color: G.text,
                    fontSize: 13,
                    outline: 'none',
                    marginTop: 6
                  }}
                />
              </div>

              <div>
                <label style={{ color: G.dim, fontSize: 12, letterSpacing: '0.1em' }}>Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  style={{
                    width: '100%',
                    background: '#0A0906',
                    border: `1px solid ${G.border}`,
                    borderRadius: 8,
                    padding: '10px 12px',
                    color: G.text,
                    fontSize: 13,
                    outline: 'none',
                    marginTop: 6
                  }}
                >
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowEdit(false)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: `1px solid ${G.border}`,
                  borderRadius: 8,
                  padding: '10px 16px',
                  color: G.dim,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600
                }}
              >
                CANCEL
              </button>
              <button
                onClick={handleSave}
                style={{
                  flex: 1,
                  background: 'linear-gradient(180deg,#F5C842,#D4AF37)',
                  border: '1px solid #F5C842',
                  borderRadius: 8,
                  padding: '10px 16px',
                  color: '#141105',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.1em'
                }}
              >
                SAVE
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
