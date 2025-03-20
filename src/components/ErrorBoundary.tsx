import React, { Component, ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    // Update state to show fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error details (e.g., to an external monitoring service)
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Fallback UI
      return <h1>Something went wrong. Please refresh the page.</h1>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
