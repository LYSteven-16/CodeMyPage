import { useState, useEffect } from 'react';

export function PreviewPage() {
  const [html, setHtml] = useState('');

  useEffect(() => {
    try {
      const savedHtml = sessionStorage.getItem('previewHtml');
      if (savedHtml) {
        setHtml(savedHtml);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      {html ? (
        <iframe
          srcDoc={html}
          style={{ width: '100%', height: '100%', border: 'none' }}
          title="Preview"
        />
      ) : (
        <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>
          暂无预览内容
        </div>
      )}
    </div>
  );
}
