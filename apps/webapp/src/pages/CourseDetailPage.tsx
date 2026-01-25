import React from 'react';
import { useNavigate } from 'react-router-dom';

export function CourseDetailPage() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 'var(--sp-4)' }}>
      <h2 style={{ color: 'var(--fg)', margin: '0 0 var(--sp-4) 0' }}>Детальная страница курса</h2>
      <p style={{ color: 'var(--muted-fg)', margin: '0 0 var(--sp-4) 0' }}>
        Это stub страница для тестирования навигации Back.
      </p>
      <button
        onClick={() => navigate(-1)}
        style={{
          padding: 'var(--sp-2) var(--sp-4)',
          backgroundColor: 'var(--accent)',
          color: 'var(--bg)',
          border: 'none',
          borderRadius: 'var(--r-md)',
          fontSize: 'var(--text-sm)',
          cursor: 'pointer',
        }}
      >
        Назад
      </button>
    </div>
  );
}
