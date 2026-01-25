import { Link } from 'react-router-dom';

export function LibraryPage() {
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
        Поиск (Story 1.5)
      </p>
      <p style={{ color: 'var(--muted-fg)', margin: '0 0 var(--sp-4) 0' }}>
        Здесь будет каталог курсов
      </p>
      <div>
        {items.map((item) => (
          <Link
            key={item}
            to={`/course/${item}`}
            style={{
              display: 'block',
              padding: 'var(--sp-3)',
              marginBottom: 'var(--sp-2)',
              backgroundColor: 'var(--card)',
              borderRadius: 'var(--r-md)',
              color: 'var(--fg)',
              textDecoration: 'none',
            }}
          >
            Элемент {item}
          </Link>
        ))}
      </div>
    </div>
  );
}
