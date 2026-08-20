import { Component, type ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <main className="gateway-page error-boundary-page">
          <section className="error-boundary-card" role="alert">
            <span className="gateway-mark" aria-hidden="true">JS</span>
            <p className="modal-eyebrow">A small detour</p>
            <h1>Something took an unexpected turn.</h1>
            <p>Refresh the page to get back to Job Scout Hub. The demo and private workspace are kept separate.</p>
            <button className="primary-button" type="button" onClick={() => window.location.reload()}>Refresh page</button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
