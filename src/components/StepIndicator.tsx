
import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface Step {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  completed: boolean;
}

interface StepIndicatorProps {
  steps: Step[];
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps }) => {
  return (
    <div className="w-full max-w-md mx-auto mb-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.completed;
          const isActive = step.active;
          
          return (
            <React.Fragment key={step.label}>
              <div className="flex flex-col items-center">
                <div 
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300",
                    isCompleted ? "bg-green-500 border-green-500 text-white" : 
                    isActive ? "bg-primary border-primary text-white" : 
                    "bg-muted/30 text-muted-foreground/50"
                  )}
                >
                  {isCompleted ? <Check className="h-5 w-5 text-white" /> : 
                   React.isValidElement(step.icon) ? 
                    React.cloneElement(step.icon as React.ReactElement, { 
                      className: `h-5 w-5 ${isActive ? "text-white" : "text-muted-foreground"}` 
                    }) : null}
                </div>
                <span 
                  className={cn(
                    "mt-2 text-xs font-medium transition-colors duration-300",
                    isCompleted ? "text-green-500" : 
                    isActive ? "text-primary" : 
                    "text-muted-foreground/50"
                  )}
                >
                  {step.label}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div 
                  className={cn(
                    "h-[2px] flex-1 mx-1 transition-all duration-500",
                    index < steps.findIndex(s => s.active) || steps.slice(0, index + 1).every(s => s.completed) 
                      ? "bg-green-500" 
                      : "bg-muted/30"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;
