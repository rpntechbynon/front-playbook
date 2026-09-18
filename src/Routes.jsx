import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Cadastro from './pages/Cadastro';
import Trilha from './pages/Trilha';
import Produtos from './pages/Produtos';
import Tela from './pages/Tela';
import Formularios from './pages/Formularios';
import Feedbacks from './pages/Feedbacks';
import FeedbackWidget from './components/FeedbackWidget';
import { isAdmin } from './utils/auth';

function RequireAdmin({ children }) {
  return isAdmin() ? children : <Navigate to="/home" replace />;
}

function AppRouter() {
  return (
    <Router basename="/playbook">
      <Routes >
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<div>About Page</div>} />
        <Route path="/cadastro" element={<RequireAdmin><Cadastro /></RequireAdmin>} />
        <Route path="/trilha" element={<Trilha />} />
        <Route path="/produtos" element={<RequireAdmin><Produtos /></RequireAdmin>} />
        <Route path="/tela" element={<RequireAdmin><Tela /></RequireAdmin>} />
        <Route path="/formularios" element={<RequireAdmin><Formularios /></RequireAdmin>} />
        <Route path="/feedbacks" element={<RequireAdmin><Feedbacks /></RequireAdmin>} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
      <FeedbackWidget />
    </Router>
  );
}

export default AppRouter;