import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const inputStyle = {
  width: '100%',
  background: '#141414',
  border: '1px solid #2A2A2A',
  borderRadius: 8,
  padding: '10px 12px',
  color: '#F2F2F2',
  fontSize: 13,
  outline: 'none',
  marginTop: 6,
};

const labelStyle = { color: '#98989D', fontSize: 12, letterSpacing: '0.08em' };

export function ProfileCard({ profile, onEditProfile }) {
  const [showEdit, setShowEdit] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    email: profile?.email || '',
    role: profile?.role || 'Manager',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onEditProfile(formData.name, formData.email, formData.role);
    setShowEdit(false);
  };

  return (
    <>
      <button
        onClick={() => setShowEdit(true)}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors hover:bg-[#121214] text-left w-full"
        style={{ border: '1px solid #232323' }}
      >
        <span
          className="w-9 h-9 rounded-full flex items-center justify-center font-semibold shrink-0"
          style={{ background: '#1C1C1E', border: '1px solid #2A2A2A', color: '#FFFFFF', fontSize: 12 }}
        >
          {profile?.name?.slice(0, 2).toUpperCase() || '+'}
        </span>
        <span className="min-w-0">
          <span className="block font-medium truncate" style={{ color: '#F2F2F2', fontSize: 13 }}>
            {profile?.name || 'Add Profile'}
          </span>
          <span className="block" style={{ color: '#8E8E93', fontSize: 10, letterSpacing: '0.12em' }}>
            {(profile?.role || 'SETUP').toUpperCase()}
          </span>
        </span>
        <ChevronDown className="w-4 h-4 ml-auto shrink-0" style={{ color: '#8E8E93' }} />
      </button>

      {showEdit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={() => setShowEdit(false)}
        >
          <div
            className="rounded-2xl p-6 w-full max-w-sm ezx-fade-in"
            style={{ background: '#0C0C0C', border: '1px solid #232323' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
              Edit Profile
            </h2>

            <div className="space-y-4">
              <div>
                <label style={labelStyle}>Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Your name" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Role</label>
                <select name="role" value={formData.role} onChange={handleChange} style={{ ...inputStyle, cursor: 'pointer' }}>
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
                  border: '1px solid #2A2A2A',
                  borderRadius: 8,
                  padding: '10px 16px',
                  color: '#A1A1A6',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                style={{
                  flex: 1,
                  background: '#FFFFFF',
                  border: '1px solid #FFFFFF',
                  borderRadius: 8,
                  padding: '10px 16px',
                  color: '#000000',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
