import React from 'react';
import { IconRenderer } from './NewStyleRenderers';

export interface ToolbarProps {
  gridSettings: {
    dotSpacing: number;
    snapToGrid: boolean;
    dotGridBackground: string;
    canvasBackground: string;
    canvasBorderRadius: number;
  };
  onGridChange: (settings: Partial<ToolbarProps['gridSettings']>) => void;
  onPreview: () => void;
  onLoad: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onExport: () => void;
  onReset: () => void;
  showGridSettings: boolean;
  showBgSettings: boolean;
  showCanvasSettings: boolean;
  onToggleGridSettings: () => void;
  onToggleBgSettings: () => void;
  onToggleCanvasSettings: () => void;
  autoSave: boolean;
  onToggleAutoSave: () => void;
}

export const TopToolbar: React.FC<ToolbarProps> = ({
  gridSettings,
  onGridChange,
  onPreview,
  onLoad,
  onExport,
  onReset,
  showGridSettings,
  showBgSettings,
  showCanvasSettings,
  onToggleGridSettings,
  onToggleBgSettings,
  onToggleCanvasSettings,
  autoSave,
  onToggleAutoSave,
}) => {
  const toolbarStyle: React.CSSProperties = {
    height: '56px',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
  };

  const buttonStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    fontSize: '13px',
    fontWeight: 500,
    color: active ? '#007aff' : '#1d1d1f',
    background: active ? 'rgba(0, 122, 255, 0.08)' : 'transparent',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
  });

  const actionButtonStyle = (variant: 'primary' | 'secondary' | 'success' | 'warning'): React.CSSProperties => {
    const colors = {
      primary: { bg: '#007aff', hover: '#0066d6' },
      secondary: { bg: '#f5f5f7', hover: '#e8e8ed' },
      success: { bg: '#34c759', hover: '#2db04e' },
      warning: { bg: '#ff9500', hover: '#e68600' },
    };
    const c = colors[variant];
    return {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 16px',
      fontSize: '13px',
      fontWeight: 500,
      color: '#ffffff',
      background: c.bg,
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      transition: 'all 0.15s ease',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    };
  };

  const dropdownStyle: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: '8px',
    background: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.04)',
    padding: '16px',
    width: '280px',
    zIndex: 100,
  };

  return (
    <div style={toolbarStyle} onClick={() => { onToggleGridSettings(); onToggleBgSettings(); onToggleCanvasSettings(); }}>
      <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#1d1d1f', margin: 0, fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif' }}>
        CodeMyPage
      </h1>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
        <div style={{ position: 'relative' }}>
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleGridSettings(); }}
            style={buttonStyle(showGridSettings)}
          >
            <IconRenderer name="grid" size={16} />
            网格
          </button>
          {showGridSettings && (
            <div style={dropdownStyle} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#1d1d1f' }}>网格设置</span>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#86868b', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={gridSettings.snapToGrid} 
                    onChange={(e) => onGridChange({ snapToGrid: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: '#007aff' }}
                  />
                  启用对齐
                </label>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '13px', color: '#86868b', width: '50px' }}>间距</span>
                <input 
                  type="range" 
                  min="0" 
                  max="60" 
                  value={gridSettings.dotSpacing} 
                  onChange={(e) => onGridChange({ dotSpacing: parseInt(e.target.value) })}
                  style={{ flex: 1, height: '4px', background: '#e8e8ed', borderRadius: '2px', appearance: 'none', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '12px', color: '#86868b', width: '45px', textAlign: 'right' }}>{gridSettings.dotSpacing}px</span>
              </div>
            </div>
          )}
        </div>

        <div style={{ position: 'relative' }}>
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleBgSettings(); }}
            style={buttonStyle(showBgSettings)}
          >
            <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: gridSettings.dotGridBackground, border: '1px solid rgba(0,0,0,0.1)' }} />
            背景
          </button>
          {showBgSettings && (
            <div style={dropdownStyle} onClick={(e) => e.stopPropagation()}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#1d1d1f', display: 'block', marginBottom: '12px' }}>背景颜色</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input 
                  type="color" 
                  value={gridSettings.dotGridBackground} 
                  onChange={(e) => onGridChange({ dotGridBackground: e.target.value })}
                  style={{ width: '40px', height: '40px', borderRadius: '8px', border: '2px solid #e8e8ed', cursor: 'pointer', padding: 0 }}
                />
                <span style={{ fontSize: '12px', color: '#86868b', fontFamily: 'monospace' }}>{gridSettings.dotGridBackground}</span>
              </div>
            </div>
          )}
        </div>

        <div style={{ position: 'relative' }}>
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleCanvasSettings(); }}
            style={buttonStyle(showCanvasSettings)}
          >
            <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: gridSettings.canvasBackground, border: '1px solid rgba(0,0,0,0.1)' }} />
            画布
          </button>
          {showCanvasSettings && (
            <div style={dropdownStyle} onClick={(e) => e.stopPropagation()}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#1d1d1f', display: 'block', marginBottom: '12px' }}>画布设置</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '13px', color: '#86868b', width: '50px' }}>颜色</span>
                <input 
                  type="color" 
                  value={gridSettings.canvasBackground} 
                  onChange={(e) => onGridChange({ canvasBackground: e.target.value })}
                  style={{ width: '40px', height: '40px', borderRadius: '8px', border: '2px solid #e8e8ed', cursor: 'pointer', padding: 0 }}
                />
                <span style={{ fontSize: '12px', color: '#86868b', fontFamily: 'monospace' }}>{gridSettings.canvasBackground}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '13px', color: '#86868b', width: '50px' }}>圆角</span>
                <input 
                  type="range" 
                  min="0" 
                  max="60" 
                  value={gridSettings.canvasBorderRadius} 
                  onChange={(e) => onGridChange({ canvasBorderRadius: parseInt(e.target.value) })}
                  style={{ flex: 1, height: '4px', background: '#e8e8ed', borderRadius: '2px', appearance: 'none', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '12px', color: '#86868b', width: '45px', textAlign: 'right' }}>{gridSettings.canvasBorderRadius}px</span>
              </div>
            </div>
          )}
        </div>

        <div style={{ width: '1px', height: '24px', background: '#e8e8ed', margin: '0 8px' }} />

        <button onClick={onPreview} style={actionButtonStyle('secondary')}>
          <IconRenderer name="eye" size={16} />
          预览
        </button>
        <label style={actionButtonStyle('warning')}>
          <IconRenderer name="upload" size={16} />
          导入
          <input type="file" accept=".json" onChange={onLoad} style={{ display: 'none' }} />
        </label>
        <button onClick={onExport} style={actionButtonStyle('primary')}>
          <IconRenderer name="download" size={16} />
          导出
        </button>
        <button
          onClick={onReset}
          style={{
            ...actionButtonStyle('secondary'),
            color: '#ff3b30'
          }}
          title="重新开始"
        >
          <IconRenderer name="rotate-cw" size={16} />
        </button>
        <button
          onClick={onToggleAutoSave}
          style={{
            ...actionButtonStyle('secondary'),
            background: autoSave ? 'rgba(52, 199, 89, 0.1)' : 'transparent',
            color: autoSave ? '#34c759' : '#8e8e93'
          }}
          title={autoSave ? '自动保存已开启' : '自动保存已关闭'}
        >
          <IconRenderer name="settings" size={16} />
        </button>
      </div>
    </div>
  );
};
