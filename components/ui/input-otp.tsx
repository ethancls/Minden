"use client";
import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { cn } from "@/lib/utils";

export const InputOTP = React.forwardRef<
  React.ElementRef<typeof OTPInput>,
  React.ComponentPropsWithoutRef<typeof OTPInput>
>(({ className, containerClassName, ...props }, ref) => (
  <OTPInput ref={ref} containerClassName={cn("flex items-center gap-2", containerClassName)} className={cn("hidden", className)} {...props} />
));
InputOTP.displayName = "InputOTP";

export const InputOTPGroup = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center gap-2", className)} {...props} />
));
InputOTPGroup.displayName = "InputOTPGroup";

export const InputOTPSlot = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div"> & { index: number }>(
  ({ index, className, ...props }, ref) => {
    const inputOTP = React.useContext(OTPInputContext);
    const char = inputOTP?.slots[index];
    return (
      <div
        ref={ref}
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-md border border-input bg-background text-center text-sm shadow-sm cursor-text select-none",
          char?.hasFakeCaret && "animate-caret-blink",
          className
        )}
        role="textbox"
        tabIndex={0}
        onClick={() => inputOTP?.inputRef?.current?.focus()}
        onFocus={() => inputOTP?.inputRef?.current?.focus()}
        {...props}
      >
        {char?.char ?? (char?.hasFakeCaret ? "|" : null)}
      </div>
    );
  }
);
InputOTPSlot.displayName = "InputOTPSlot";

export const InputOTPSeparator = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(({ className, ...props }, ref) => (
  <div ref={ref} role="separator" className={cn("mx-2 w-2", className)} {...props} />
));
InputOTPSeparator.displayName = "InputOTPSeparator";
