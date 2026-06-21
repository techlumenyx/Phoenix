import { Route, Routes } from 'react-router-dom';

export function App() {
  return (
    <div>
      <h1>Christian Listings</h1>
      <Routes>
        <Route path="/" element={<div>Home</div>} />
      </Routes>
    </div>
  );
}

export default App;
