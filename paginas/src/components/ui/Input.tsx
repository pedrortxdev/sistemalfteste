import * as React from "react"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: string
    label?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, error, label, ...props }, ref) => {
        return (
            <div className="flex flex-col w-full space-y-1.5">
                {label && (
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        {label}
                    </label>
                )}
                <div className="relative">
                    <input
                        type={type}
                        className={`flex h-12 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors ${error ? "border-red-500 focus-visible:ring-red-500 bg-red-50" : ""} ${className || ""}`}
                        ref={ref}
                        {...props}
                    />
                </div>
                {error && <span className="text-xs font-semibold text-red-600">{error}</span>}
            </div>
        )
    }
)
Input.displayName = "Input"

export { Input }
