import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Cadastro from './pages/Cadastro';
import Trilha from './pages/Trilha';
import Produtos from './pages/Produtos';

function AppRouter() {
  return (
    <Router >
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<div>About Page</div>} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/trilha" element={<Trilha />} />
        <Route path="/produtos" element={<Produtos />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;