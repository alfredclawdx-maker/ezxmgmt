import { Settings } from 'lucide-react';

export function SettingsPage() {
  return (
    <div className="min-h-full flex flex-col items-center justify-center rounded-2xl p-8" style={{ background: '#000000', border: '1px solid #2C2C2E' }}>
      <Settings className="w-10 h-10 mb-5" style={{ color: '#48484A' }} strokeWidth={1.5} />
      <h1 style={{ color: '#FFFFFF', fontSize: 22, fontWeight: 600 }}>Settings</h1>
      <p style={{ color: '#8E8E93', fontSize: 14, marginTop: 8 }}>Coming soon</p>
    </div>
  );
}
