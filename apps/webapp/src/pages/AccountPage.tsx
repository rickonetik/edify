import React from 'react';

export function AccountPage() {
  // Test content: 100 items for scroll testing
  const items = Array.from({ length: 100 }, (_, i) => i + 1);

  return (
    <div style={{ padding: 'var(--sp-4)' }}>
      <p
        style={{
          color: 'var(--muted-fg)',
          fontSize: 'var(--text-sm)',
          margin: '0 0 var(--sp-4) 0',
        }}
      >
        Настройки (Story 1.7)
      </p>
      <p style={{ color: 'var(--muted-fg)', margin: '0 0 var(--sp-4) 0' }}>
        Здесь будет информация о профиле
      </p>
      <div>
        {items.map((item) => (
          <div
            key={item}
            style={{
              padding: 'var(--sp-3)',
              marginBottom: 'var(--sp-2)',
              backgroundColor: 'var(--card)',
              borderRadius: 'var(--r-md)',
              color: 'var(--fg)',
            }}
          >
            Настройка {item}
          </div>
        ))}
      </div>
    </div>
  );
}
