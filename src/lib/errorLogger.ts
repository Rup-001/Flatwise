
import { toast } from "sonner";

type ErrorSeverity = "info" | "warning" | "error" | "critical";

interface ErrorLogEntry {
  message: string;
  timestamp: Date;
  stack?: string;
  severity: ErrorSeverity;
  context?: Record<string, any>;
}

class ErrorLogger {
  private static logs: ErrorLogEntry[] = [];
  private static readonly MAX_LOGS = 100;
  private static readonly STORAGE_KEY = "app_error_logs";

  static {
    // Load logs from localStorage on initialization
    try {
      const storedLogs = localStorage.getItem(this.STORAGE_KEY);
      if (storedLogs) {
        const parsedLogs = JSON.parse(storedLogs);
        // Convert string timestamps back to Date objects
        this.logs = parsedLogs.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp)
        }));
      }
    } catch (e) {
      console.error("Failed to load logs from localStorage", e);
      this.logs = [];
    }
  }

  static log(
    message: string, 
    severity: ErrorSeverity = "error", 
    error?: Error, 
    context?: Record<string, any>
  ): void {
    const entry: ErrorLogEntry = {
      message,
      timestamp: new Date(),
      severity,
      context,
    };

    if (error?.stack) {
      entry.stack = error.stack;
    }

    // Add to in-memory log
    this.logs.unshift(entry);
    
    // Trim logs to prevent memory issues
    if (this.logs.length > this.MAX_LOGS) {
      this.logs = this.logs.slice(0, this.MAX_LOGS);
    }

    // Save to localStorage
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.logs));
    } catch (e) {
      console.error("Failed to save logs to localStorage", e);
    }

    // Console output with detailed information
    console.error(`[${severity.toUpperCase()}] ${message}`, { 
      error, 
      context,
      stack: error?.stack,
      timestamp: entry.timestamp 
    });

    // Show toast for user with more detailed error information
    if (severity === "error" || severity === "critical") {
      const detailedMessage = error?.message 
        ? `${message}: ${error.message}`
        : message;
      
      toast.error(detailedMessage, {
        description: context?.endpoint 
          ? `API Error on ${context.endpoint}`
          : undefined,
        duration: 5000,
      });
    } else if (severity === "warning") {
      toast.warning(message);
    } else {
      toast.info(message);
    }

    // For critical errors, we could also send to an analytics or monitoring service
    if (severity === "critical") {
      // Future implementation could send to a monitoring service
    }
  }

  static getRecentLogs(count: number = 10): ErrorLogEntry[] {
    return this.logs.slice(0, count);
  }

  static getAllLogs(): ErrorLogEntry[] {
    return [...this.logs];
  }

  static clearLogs(): void {
    this.logs = [];
    localStorage.removeItem(this.STORAGE_KEY);
  }

  static exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Global error handler
export const setupGlobalErrorHandler = (): void => {
  window.addEventListener('error', (event) => {
    ErrorLogger.log(
      `Unhandled error: ${event.message}`,
      "critical",
      event.error,
      { location: event.filename, lineNo: event.lineno, colNo: event.colno }
    );
  });

  window.addEventListener('unhandledrejection', (event) => {
    const errorMessage = event.reason?.message || 'Unknown promise rejection';
    const errorObj = event.reason instanceof Error ? event.reason : new Error(errorMessage);
    
    ErrorLogger.log(
      `Unhandled promise rejection: ${errorMessage}`,
      "critical",
      errorObj,
      { reason: JSON.stringify(event.reason) }
    );
  });
};

export default ErrorLogger;
