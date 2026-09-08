export function AuthFlowDiagram() {
  return <figure className="auth-flow">
    <div aria-hidden="true" data-copy-page-ignore>
      <div className="auth-flow-title">How components connect</div>
      <div className="auth-flow-lanes">
        <b>Your frontend</b><b>Your backend</b><b>MindBill API</b>
      </div>
      <div className="auth-flow-sequence">
        <div className="auth-flow-message auth-flow-first">
          <span>1. Request a session</span><i />
        </div>
        <div className="auth-flow-message auth-flow-second">
          <span>2. Create session · API key</span><i />
        </div>
        <div className="auth-flow-message auth-flow-wide auth-flow-return">
          <span>3. Return session token via your backend</span><i /><em />
        </div>
        <div className="auth-flow-message auth-flow-wide auth-flow-direct">
          <span>4. Call MindBill directly · session token</span><i />
        </div>
      </div>
      <div className="auth-flow-comparison">
        <div className="auth-flow-title">Backend-only API integration</div>
        <div className="auth-flow-server">
          <b>Your backend</b><span>API key<i /></span><b>MindBill API</b>
        </div>
      </div>
    </div>
    <figcaption><p>Your backend checks the signed-in user and uses its API key to ask MindBill for a short-lived session token. It returns that token to your frontend, which calls MindBill directly. With a backend-only integration, your server calls MindBill using the API key. <strong>The API key stays on your server in both flows.</strong></p></figcaption>
  </figure>;
}
