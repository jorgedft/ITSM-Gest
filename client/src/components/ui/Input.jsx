export function Input({
    label,
    error,
    className = '',
    ...props
}) {
    return (
        <div>
            {label && <label className="label">{label}</label>}
            <input
                className={`input-field ${className}`}
                {...props}
            />
            {error && (
                <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
        </div>
    );
}