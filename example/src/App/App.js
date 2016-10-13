import React from 'react';
import { BrowserRouter, Match, Link } from 'react-router';
import CodeSplitComponent from '../../../src/index';

function App() {
  return (
    <BrowserRouter>
      <div>
        <h1>Code Split Component Example</h1>
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
        </ul>
        <div>
          <Match
            exactly
            pattern="/"
            render={() =>
              <CodeSplitComponent path="./Home">
                { Home => (Home ? <Home /> : <div>Loading...</div>) }
              </CodeSplitComponent>
            }
          />

          <Match
            pattern="/about"
            render={() =>
              <CodeSplitComponent path="./About">
                { About => (About ? <About /> : <div>Loading...</div>) }
              </CodeSplitComponent>
            }
          />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
