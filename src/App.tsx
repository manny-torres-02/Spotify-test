import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <div>
        <h1>Spotify</h1>
        <section className="card music-selection"></section>
        <h1>Display your Spotify profile data</h1>

        <section id="profile">
          <h2>
            Logged in as <span id="displayName"></span>
          </h2>
          <span id="avatar"></span>
          <ul>
            <li>
              User ID: <span id="id"></span>
            </li>
            <li>
              Email: <span id="email"></span>
            </li>
            <li>
              Spotify URI: <a id="uri" href="#"></a>
            </li>
            <li>
              Link: <a id="url" href="#"></a>
            </li>
            <li>
              Profile Image: <span id="imgUrl"></span>
            </li>
          </ul>
        </section>
        <button>pull top artists </button>
      </div>
    </>
  );
}

export default App;
