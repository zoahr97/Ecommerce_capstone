import { useEffect, useState } from 'react';

export default function AccessibilityMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const updateSetting = (setting, enabled) => {
    document.body.classList.toggle(setting, enabled);

    localStorage.setItem(
      `accessibility-${setting}`,
      String(enabled)
    );
  };

  useEffect(() => {
    ['high-contrast', 'grayscale', 'large-text'].forEach(
      (setting) => {
        const enabled =
          localStorage.getItem(
            `accessibility-${setting}`
          ) === 'true';

        document.body.classList.toggle(setting, enabled);
      }
    );
  }, []);

  const toggleSetting = (setting) => {
    const enabled = !document.body.classList.contains(
      setting
    );

    updateSetting(setting, enabled);
  };

  const resetSettings = () => {
    ['high-contrast', 'grayscale', 'large-text'].forEach(
      (setting) => {
        document.body.classList.remove(setting);

        localStorage.removeItem(
          `accessibility-${setting}`
        );
      }
    );
  };

  return (
   <div className="accessibility-widget">
    
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '64px',
            left: 0,
            width: '220px',
            backgroundColor: '#fff',
            border: '1px solid #222',
            padding: '14px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
          }}
        >
          <h3
            style={{
              margin: '0 0 12px',
              fontSize: '1rem'
            }}
          >
            Accessibility options
          </h3>

          <button
            type="button"
            onClick={() =>
              toggleSetting('large-text')
            }
            style={menuButtonStyle}
          >
            Increase text size
          </button>

          <button
            type="button"
            onClick={() =>
              toggleSetting('high-contrast')
            }
            style={menuButtonStyle}
          >
            High contrast
          </button>

          <button
            type="button"
            onClick={() =>
              toggleSetting('grayscale')
            }
            style={menuButtonStyle}
          >
            Grayscale
          </button>

          <button
            type="button"
            onClick={resetSettings}
            style={{
              ...menuButtonStyle,
              marginBottom: 0
            }}
          >
            Reset settings
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open accessibility options"
        aria-expanded={isOpen}
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          border: '2px solid #222',
          backgroundColor: '#fff',
          color: '#222',
          fontSize: '1.5rem',
          cursor: 'pointer',
          boxShadow: '0 3px 10px rgba(0,0,0,0.2)'
        }}
      >
        ♿
      </button>
    </div>
  );
}

const menuButtonStyle = {
  display: 'block',
  width: '100%',
  marginBottom: '8px',
  padding: '9px',
  border: '1px solid #222',
  backgroundColor: '#fff',
  color: '#222',
  textAlign: 'left',
  cursor: 'pointer'
};