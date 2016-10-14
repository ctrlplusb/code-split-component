import React from 'react';
import { BrowserRouter, Match, Link } from 'react-router';
import CodeSplit from '../../../src/index';

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
              <CodeSplit module={System.import('./Home')}>
                { Home => (Home ? <Home /> : <div>Loading...</div>) }
              </CodeSplit>
            }
          />

          <Match
            pattern="/about"
            render={() =>
              <CodeSplit module={System.import('./About')}>
                { About => (About ? <About /> : <div>Loading...</div>) }
              </CodeSplit>
            }
          />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
