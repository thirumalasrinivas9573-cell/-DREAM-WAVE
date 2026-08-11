import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '../ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message?: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('UI error boundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-wave-grid p-6">
          <div className="card-surface max-w-md text-center">
            <h1 className="font-display text-2xl font-bold">Something went wrong</h1>
            <p className="mt-2 text-sm text-slate-500">
              {this.state.message || 'An unexpected error occurred in the interface.'}
            </p>
            <Button
              className="mt-6"
              onClick={() => {
                this.setState({ hasError: false, message: undefined });
                window.location.href = '/';
              }}
            >
              Go home
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
