import React from 'react';

export default function Modal({ isOpen, title, content, onConfirm, onCancel, confirmText = '확인', cancelText = '취소' }) {
  if (!isOpen) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle} className="fade-in">
        {title && <h3 style={titleStyle}>{title}</h3>}
        <p style={contentStyle}>{content}</p>
        <div style={buttonContainerStyle}>
          {onCancel && (
            <button style={cancelButtonStyle} onClick={onCancel}>
              {cancelText}
            </button>
          )}
          <button style={confirmButtonStyle} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

const modalStyle = {
  backgroundColor: 'white',
  padding: '24px',
  borderRadius: '16px',
  width: '80%',
  maxWidth: '320px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
};

const titleStyle = {
  marginTop: 0,
  marginBottom: '12px',
  fontSize: '18px',
  color: 'var(--color-text-main)',
  textAlign: 'center',
};

const contentStyle = {
  marginBottom: '24px',
  fontSize: '15px',
  color: 'var(--color-text-sub)',
  textAlign: 'center',
  lineHeight: '1.5',
  whiteSpace: 'pre-wrap',
};

const buttonContainerStyle = {
  display: 'flex',
  gap: '12px',
  justifyContent: 'center',
};

const baseButtonStyle = {
  flex: 1,
  padding: '10px 0',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: 'bold',
  cursor: 'pointer',
  border: 'none',
};

const cancelButtonStyle = {
  ...baseButtonStyle,
  backgroundColor: '#f1f3f5',
  color: '#495057',
};

const confirmButtonStyle = {
  ...baseButtonStyle,
  backgroundColor: 'var(--color-primary)',
  color: 'white',
};
