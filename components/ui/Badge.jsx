export default function Badge({ 
  children, 
  variant = 'default', 
  className = '',
  size = 'md'
}) {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    gold: 'bg-yellow-100 text-yellow-700',
    silver: 'bg-gray-200 text-gray-700',
    bronze: 'bg-amber-100 text-amber-700',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  };

  const variantClasses = variants[variant] || variants.default;
  const sizeClasses = sizes[size] || sizes.md;

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-medium ${variantClasses} ${sizeClasses} ${className} max-w-full truncate`}
    >
      {children}
    </span>
  );
}