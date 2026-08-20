
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
  const baseStyles = "transition-all duration-200 font-bold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 rounded-md";
  
  const sizeStyles = {
    sm: "text-xs px-3 py-1.5",
    md: "text-sm px-5 py-2.5",
    lg: "text-base px-7 py-3.5"
  };

  const variants = {
    primary: "bg-gold-500 hover:bg-gold-600 text-white shadow-sm uppercase tracking-wider", 
    secondary: "bg-beige-50 border border-gold-500/50 text-gold-600 hover:bg-gold-100/60 uppercase tracking-wider", 
    ghost: "text-charcoal-700 hover:text-charcoal-900 hover:bg-beige-100/70",
    danger: "text-red-600 hover:bg-red-50",
    icon: "p-2 text-charcoal-600 hover:bg-beige-100 rounded-full",
    outline: "border border-app-border bg-transparent hover:bg-beige-100/50 text-charcoal-800"
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
            border border-app-border rounded-md
            focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30
            outline-none 
            py-2.5 px-3
            text-charcoal-900 placeholder-charcoal-500/50 font-medium
            transition-all duration-150
            shadow-sm
            ${icon ? 'pl-9' : ''}
            ${isMonospaced ? 'font-mono' : 'font-sans'}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-red-600 text-xs mt-1 font-bold">{error}</p>}
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
          border-b border-app-border
          focus:border-gold-500
          outline-none 
          py-2 px-0
          text-charcoal-900 placeholder-charcoal-500/50
          transition-all duration-200
          font-sans
        `}
        {...props}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
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
          border border-app-border rounded-md
          focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30
          outline-none 
          py-2.5 px-3
          text-charcoal-900 font-medium
          shadow-sm
          font-sans
          cursor-pointer
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
    <div className={`bg-white border border-app-border rounded-lg shadow-card ${className}`}>
      {(title || headerAction) && (
        <div className="px-5 py-3 border-b border-app-border flex justify-between items-center bg-app-card/60 rounded-t-lg">
          {title && <h3 className="font-bold text-charcoal-900 text-sm tracking-wide uppercase">{title}</h3>}
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
    <div className="relative flex items-center justify-center w-16 h-16">
        <img src="/logo.png" alt="MJ Logo" className="w-full h-full object-contain" />
    </div>
  </div>
);
