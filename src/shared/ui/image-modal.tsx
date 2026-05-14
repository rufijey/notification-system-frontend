import { X, Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt?: string;
}

export const ImageModal = ({ isOpen, onClose, src, alt }: ImageModalProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setIsLoaded(false);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = src;
    link.download = alt || 'image';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm transition-all duration-300 animate-in fade-in"
      onClick={onClose}
    >
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button 
          onClick={(e) => { e.stopPropagation(); handleDownload(); }}
          className="p-2 text-neutral-400 hover:text-white bg-neutral-900/50 rounded-full transition-colors cursor-pointer"
          title="Download image"
        >
          <Download size={20} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="p-2 text-neutral-400 hover:text-white bg-neutral-900/50 rounded-full transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>
      </div>

      <div 
        className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-violet-600/30 border-t-violet-600 rounded-full animate-spin"></div>
          </div>
        )}
        <img 
          src={src} 
          alt={alt || 'Full screen preview'} 
          className={`max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl transition-all duration-500 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
          onLoad={() => setIsLoaded(true)}
        />
      </div>
    </div>,
    document.body
  );
};
