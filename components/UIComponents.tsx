
import React from 'react';

// --- TOAST HELPER ---
export const toast = (props: { title: string; description?: string; variant?: 'default' | 'destructive' }) => {
  console.log(`TOAST [${props.variant || 'default'}]: ${props.title} - ${props.description}`);
  if (props.variant === 'destructive') {
    alert(`${props.title}: ${props.description}`);
  }
};

// --- BUTTONS ---

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'icon' | 'danger' | 'outline';
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  size = 'md',
  className = '', 
  ...props 
}) => {
  const baseStyles = "transition-all duration-200 font-bold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-lg cursor-pointer active:scale-[0.98]";
  
  const sizeStyles = {
    sm: "text-xs px-3.5 py-2",
    md: "text-sm px-5 py-2.5",
    lg: "text-base px-7 py-3.5"
  };

  const variants = {
    primary: "btn-gold-gradient text-white shadow-luxury uppercase tracking-wider", 
    secondary: "bg-gold-50/70 border border-gold-500/40 text-gold-700 hover:bg-gold-100/80 hover:border-gold-500 uppercase tracking-wider shadow-sm", 
    ghost: "text-charcoal-700 hover:text-charcoal-900 hover:bg-gold-50/60",
    danger: "text-rose-600 bg-rose-50/60 hover:bg-rose-100/80 border border-rose-200",
    icon: "p-2.5 text-charcoal-600 hover:bg-gold-50/80 rounded-full hover:scale-105 transition-transform",
    outline: "border border-app-border bg-white hover:bg-gold-50/40 text-charcoal-800 shadow-sm"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};

// --- INPUTS (Soft-Box Style) ---

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  isMonospaced?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ 
  label, 
  error, 
  icon, 
  className = '', 
  isMonospaced = false,
  ...props 
}, ref) => {
  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-charcoal-800 mb-1.5 uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-500 pointer-events-none">
            {icon}
          </div>
        )}
        <input 
          ref={ref}
          className={`
            w-full bg-white 
            border border-app-border rounded-lg
            focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20
            outline-none 
            py-2.5 px-3.5
            text-charcoal-900 placeholder-charcoal-500/40 font-medium
            transition-all duration-200
            shadow-sm hover:border-gold-500/40
            ${icon ? 'pl-9.5' : ''}
            ${isMonospaced ? 'font-mono' : 'font-sans'}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-rose-600 text-xs mt-1 font-bold">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';

// --- UNDERLINE INPUT ---

interface UnderlineInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const UnderlineInput: React.FC<UnderlineInputProps> = ({ 
  label, 
  error, 
  className = '', 
  ...props 
}) => {
  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-charcoal-800 mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      <input 
        className={`
          w-full bg-transparent 
          border-b-2 border-app-border
          focus:border-gold-500
          outline-none 
          py-2 px-0
          text-charcoal-900 placeholder-charcoal-500/40
          transition-all duration-200
          font-sans font-medium
        `}
        {...props}
      />
      {error && <p className="text-rose-500 text-xs mt-1 font-bold">{error}</p>}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({ label, options, className = '', ...props }) => {
  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-xs font-bold text-charcoal-800 mb-1.5 uppercase tracking-wide">
          {label}
        </label>
      )}
      <select 
        className={`
          w-full bg-white 
          border border-app-border rounded-lg
          focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20
          outline-none 
          py-2.5 px-3.5
          text-charcoal-900 font-medium
          shadow-sm
          font-sans
          cursor-pointer
          transition-all duration-200 hover:border-gold-500/40
        `}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
};

// --- CARDS ---

export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string; headerAction?: React.ReactNode }> = ({ 
  children, 
  className = '',
  title,
  headerAction
}) => {
  return (
    <div className={`bg-white border border-app-border rounded-xl shadow-card transition-all duration-200 hover:shadow-luxury ${className}`}>
      {(title || headerAction) && (
        <div className="px-5 py-3.5 border-b border-app-border flex justify-between items-center bg-app-card/60 rounded-t-xl">
          {title && <h3 className="font-bold text-charcoal-900 text-xs tracking-wider uppercase">{title}</h3>}
          {headerAction}
        </div>
      )}
      <div className="p-5">
        {children}
      </div>
    </div>
  );
};

// --- LOGO (BRAND ICON) ---

export const Logo: React.FC<{ className?: string, light?: boolean }> = ({ className = '', light = false }) => (
  <div className={`flex flex-col items-center justify-center ${className}`}>
    <div className="relative flex items-center justify-center w-16 h-16 transition-transform hover:scale-105">
        <img src="/logowithoutbg.png" alt="Azeez Jewels Logo" className="w-full h-full object-contain filter drop-shadow-md" />
    </div>
  </div>
);
