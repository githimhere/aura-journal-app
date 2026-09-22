import React from 'react';

// --- Neumorphic Button ---
interface NeuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  variant?: 'primary' | 'danger' | 'default';
}

export const NeuButton: React.FC<NeuButtonProps> = ({ children, active, variant = 'default', className = '', ...props }) => {
  const baseStyles = "relative px-6 py-3 rounded-xl font-medium transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const lightShadow = active 
    ? "shadow-[inset_5px_5px_10px_#bebebe,inset_-5px_-5px_10px_#ffffff]" 
    : "shadow-[5px_5px_10px_#bebebe,-5px_-5px_10px_#ffffff] hover:shadow-[7px_7px_14px_#bebebe,-7px_-7px_14px_#ffffff]";
    
  const darkShadow = active
    ? "dark:shadow-[inset_5px_5px_10px_#151c26,inset_-5px_-5px_10px_#293648]"
    : "dark:shadow-[5px_5px_10px_#151c26,-5px_-5px_10px_#293648] dark:hover:shadow-[7px_7px_14px_#151c26,-7px_-7px_14px_#293648]";

  let colorStyles = "bg-neu-base dark:bg-gray-800 text-gray-600 dark:text-gray-300";
  if (variant === 'primary') colorStyles = "bg-blue-500 text-white dark:bg-blue-600";
  if (variant === 'danger') colorStyles = "bg-red-500 text-white dark:bg-red-600";

  // Override shadows for colored buttons to be simpler or distinct
  if (variant !== 'default') {
    return (
      <button 
        className={`${baseStyles} ${colorStyles} shadow-lg hover:shadow-xl ${className}`}
        {...props}
      >
        {children}
      </button>
    )
  }

  return (
    <button 
      className={`${baseStyles} ${colorStyles} ${lightShadow} ${darkShadow} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// --- Glass Card ---
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick }) => {
  // Light mode: More opaque white (bg-white/60) and slightly stronger border for pop.
  // Dark mode: Retain the subtle dark glass look.
  return (
    <div 
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl border border-white/60 dark:border-white/10 bg-white/60 dark:bg-black/30 backdrop-blur-xl shadow-xl ${className}`}
    >
      {children}
    </div>
  );
};

// --- Input Field (Neumorphic) ---
interface NeuInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const NeuInput: React.FC<NeuInputProps> = (props) => {
  return (
    <input 
      className={`w-full bg-neu-base dark:bg-gray-800 rounded-xl px-4 py-3 outline-none text-gray-700 dark:text-gray-200 shadow-[inset_3px_3px_6px_#bebebe,inset_-3px_-3px_6px_#ffffff] dark:shadow-[inset_3px_3px_6px_#151c26,inset_-3px_-3px_6px_#293648] transition-colors disabled:opacity-50 ${props.className || ''}`}
      {...props}
    />
  );
};

// --- Text Area (Neumorphic) ---
interface NeuTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const NeuTextArea: React.FC<NeuTextAreaProps> = (props) => {
  return (
    <textarea 
      className={`w-full bg-neu-base dark:bg-gray-800 rounded-xl px-4 py-3 outline-none text-gray-700 dark:text-gray-200 shadow-[inset_3px_3px_6px_#bebebe,inset_-3px_-3px_6px_#ffffff] dark:shadow-[inset_3px_3px_6px_#151c26,inset_-3px_-3px_6px_#293648] transition-colors resize-none ${props.className || ''}`}
      {...props}
    />
  );
};

// --- Toggle Switch ---
interface NeuSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export const NeuSwitch: React.FC<NeuSwitchProps> = ({ checked, onChange, label }) => {
  return (
    <div className="flex items-center justify-between cursor-pointer gap-4" onClick={() => onChange(!checked)}>
      {label && <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>}
      <div className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${checked ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`}>
        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-0'}`}></div>
      </div>
    </div>
  );
};

// --- Modal ---
interface NeuModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const NeuModal: React.FC<NeuModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <GlassCard className="p-6 bg-white/90 dark:bg-gray-900/90 border border-white/50 shadow-2xl">
          {title && <h3 className="text-xl font-black text-center mb-4 text-gray-800 dark:text-white">{title}</h3>}
          {children}
        </GlassCard>
      </div>
    </div>
  );
};
