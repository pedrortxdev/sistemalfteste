import * as React from "react"

const buttonVariants = {
    primary: "bg-[#0066cc] text-white hover:bg-[#0052a3] border border-transparent shadow-sm",
    secondary: "bg-[#e5e5e5] text-[#111111] hover:bg-[#d4d4d4] border border-transparent",
    danger: "bg-[#dc2626] text-white hover:bg-[#b91c1c] border border-transparent shadow-sm",
    ghost: "bg-transparent text-[#666666] hover:bg-gray-100 border border-transparent hover:text-[#111111]",
}

const buttonSizes = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 py-2",
    lg: "h-12 px-8 text-lg font-bold",
    icon: "h-10 w-10 justify-center p-0",
}

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: keyof typeof buttonVariants
    size?: keyof typeof buttonSizes
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", ...props }, ref) => {
        return (
            <button
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 ${buttonVariants[variant]} ${buttonSizes[size]} ${className || ""}`}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
