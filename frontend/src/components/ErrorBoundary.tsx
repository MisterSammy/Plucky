import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('Uncaught render error:', error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground gap-4">
                    <h1 className="text-2xl font-bold">Something went wrong</h1>
                    <p className="text-muted">An unexpected error occurred.</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 rounded-md bg-accent text-white hover:bg-accent-hover"
                    >
                        Reload
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
