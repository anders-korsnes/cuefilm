import { Component } from "react";
import type { ReactNode, ErrorInfo } from "react";

type Props = {
  children: ReactNode;
};

type State = {
  hasError: boolean;
};

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="app" style={{ textAlign: "center", paddingTop: "4rem" }}>
          <h1 style={{ fontSize: "2rem", marginBottom: "1rem" }}>MoodFlix</h1>
          <p style={{ marginBottom: "1.5rem", opacity: 0.7 }}>
            Noe gikk galt. Prøv å laste siden på nytt.
          </p>
          <button
            className="submit-button"
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
          >
            Last inn på nytt
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
