import React from 'react';

export function TopBar() {
  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '56px',
        paddingTop: 'var(--safe-top, 0px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--chrome-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        borderBottom: '1px solid var(--chrome-border)',
        zIndex: 100,
        paddingLeft: 'var(--sp-4)',
        paddingRight: 'var(--sp-4)',
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: 'var(--text-lg)',
          fontWeight: 'var(--font-weight-semibold)',
          color: 'var(--fg)',
          lineHeight: '1.2',
        }}
      >
        Edify
      </h1>
    </header>
  );
}
