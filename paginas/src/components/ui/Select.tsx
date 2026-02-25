import * as React from "react"

export interface SelectProps
    extends React.SelectHTMLAttributes<HTMLSelectElement> {
    error?: string
    label?: string
    options: { value: string; label: string }[]
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, error, label, options, ...props }, ref) => {
        return (
            <div className="flex flex-col w-full space-y-1.5">
                {label && (
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        {label}
                    </label>
                )}
                <select
                    className={`flex h-12 w-full items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium ring-offset-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#111111] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23111111%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-[position:right_1rem_center] bg-no-repeat pr-10 transition-colors cursor-pointer ${error ? "border-red-500 focus:ring-red-500 bg-red-50" : ""} ${className || ""}`}
                    ref={ref}
                    {...props}
                >
                    <option value="" disabled selected hidden>
                        Selecione uma opção
                    </option>
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                {error && <span className="text-xs font-semibold text-red-600">{error}</span>}
            </div>
        )
    }
)
Select.displayName = "Select"

export { Select }
