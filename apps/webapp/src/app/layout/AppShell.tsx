import React from 'react';
import { Outlet } from 'react-router-dom';
import { BottomTabs } from './BottomTabs.js';

export function AppShell() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          paddingBottom: 'calc(60px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <Outlet />
      </main>
      <BottomTabs />
    </div>
  );
}
