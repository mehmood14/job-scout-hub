import { useState } from "react";
import { ApplicationForm } from "../features/applications/components/ApplicationForm";
import { ApplicationsWorkspace } from "../features/applications/components/ApplicationsWorkspace";
import { Journey } from "../features/applications/components/Journey";


function App() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <main>
      <header>
        <h1>Job Scout Hub</h1>

        <button
          type="button"
          onClick={() => setIsFormOpen((current) => !current)}
        >
          {isFormOpen ? "Close" : "New application"}
        </button>
      </header>

      {isFormOpen && <ApplicationForm />}

      <Journey />

      <ApplicationsWorkspace />
    </main>
  );
}

export default App;