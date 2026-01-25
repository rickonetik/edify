import { NavLink, useLocation } from 'react-router-dom';

const tabs = [
  { path: '/library', label: 'Библиотека', icon: '📚' },
  { path: '/learn', label: 'Обучение', icon: '📖', isPrimary: true },
  { path: '/account', label: 'Аккаунт', icon: '👤' },
];

export function BottomTabs() {
  const location = useLocation();

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '60px',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: 'var(--chrome-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        borderTop: '1px solid var(--chrome-border)',
        paddingTop: 'var(--sp-2)',
        paddingBottom: 'calc(var(--sp-2) + var(--safe-bottom, 0px))',
        zIndex: 1000,
      }}
    >
      {tabs.map((tab) => {
        const isPrimary = tab.isPrimary || false;
        const isActive =
          location.pathname === tab.path || location.pathname.startsWith(tab.path + '/');

        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--sp-1)',
              textDecoration: 'none',
              color: isActive ? 'var(--accent)' : 'var(--muted-fg)',
              fontWeight:
                isActive || isPrimary
                  ? 'var(--font-weight-semibold)'
                  : 'var(--font-weight-regular)',
              fontSize: isPrimary ? 'var(--text-sm)' : 'var(--text-xs)',
              padding: 'var(--sp-2) var(--sp-4)',
              borderRadius: 'var(--r-md)',
              transition: 'color 0.2s',
            }}
          >
            <span style={{ fontSize: isPrimary ? '22px' : '20px' }}>{tab.icon}</span>
            <span>{tab.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
