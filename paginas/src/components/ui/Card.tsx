import * as React from "react"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> { }

function Card({ className, ...props }: CardProps) {
    return (
        <div
            className={`rounded-2xl border border-gray-200 bg-white text-gray-950 shadow-sm ${className || ""}`}
            {...props}
        />
    )
}

function CardHeader({ className, ...props }: CardProps) {
    return <div className={`flex flex-col space-y-1.5 p-6 ${className || ""}`} {...props} />
}

function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return <h3 className={`text-lg font-semibold leading-none tracking-tight ${className || ""}`} {...props} />
}

function CardContent({ className, ...props }: CardProps) {
    return <div className={`p-6 pt-0 ${className || ""}`} {...props} />
}

function CardFooter({ className, ...props }: CardProps) {
    return <div className={`flex items-center p-6 pt-0 ${className || ""}`} {...props} />
}

export { Card, CardHeader, CardTitle, CardContent, CardFooter }
