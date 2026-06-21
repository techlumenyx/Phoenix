import { Route, Routes } from 'react-router-dom';

export function App() {
  return (
    <div>
      <h1>CL Admin</h1>
      <Routes>
        <Route path="/" element={<div>Admin Dashboard</div>} />
      </Routes>
    </div>
  );
}

export default App;
