import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function Modal({ title, onClose, children }) {
  const ref = useRef();

  useEffect(() => {
    const handler = (e) => { if (e.target === ref.current) onClose?.(); };
    document.addEventListener('mođã dùngown', handler);
    return () => document.removeEventListener('mođã dùngown', handler);
  }, [onClose]);

  return (
    <div className="modal-backdrop" ref={ref}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button
            className="btn btn-ghost btn-sm"
            onClick={onClose}
            style={{ padding: '6px' }}
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
