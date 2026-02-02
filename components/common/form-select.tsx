"use client"

import { forwardRef } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface FormSelectProps {
  label: string
  placeholder?: string
  error?: string
  required?: boolean
  description?: string
  options: { value: string; label: string }[]
  value?: string
  onValueChange?: (value: string) => void
  className?: string
}

export const FormSelect = forwardRef<HTMLButtonElement, FormSelectProps>(
  ({ label, placeholder, error, required, description, options, value, onValueChange, className }, ref) => {
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger ref={ref} className={cn(error && "border-destructive focus:ring-destructive", className)}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    )
  },
)

FormSelect.displayName = "FormSelect"
