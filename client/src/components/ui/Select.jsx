export function Select({ label, error, options = [], placeholder, className = '', ...props }) {
    return (
        <div>
            {label && <label className="label">{label}</label>}
            <select className={`input-field ${className}`} {...props}>
                {placeholder && <option value="">{placeholder}</option>}
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
}