import { useState } from 'react';
import BarraPlayBook from '../../components/BarraPlayBook';
import SidebarCategorias from '../../components/SidebarCategorias';
import AlertaOportunidade from '../../components/AlertaOportunidade';
import CardCliente from '../../components/CardCliente';
import GanchoAbertura from '../../components/GanchoAbertura';
import ScriptPitch from '../../components/ScriptPitch';
import RecomendacoesEstrategicas from '../../components/RecomendacoesEstrategicas';
import ObjecoesRebatidas from '../../components/ObjecoesRebatidas';
import ScriptFechamento from '../../components/ScriptFechamento';

const Tela = () => {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <BarraPlayBook onMenuClick={() => setMenuAberto(true)} />
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* Backdrop - Overlay escuro em mobile */}
        {menuAberto && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setMenuAberto(false)}
          />
        )}

        {/* Sidebar Esquerda - Drawer em mobile, fixa em desktop */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
          transform transition-transform duration-300 ease-in-out
          ${menuAberto ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <SidebarCategorias onClose={() => setMenuAberto(false)} />
        </div>
        
        {/* Conteúdo Principal */}
        <div className="flex-1 p-3 md:p-6 overflow-auto">
          <div className="space-y-3 md:space-y-4 mb-3 md:mb-4">
            <AlertaOportunidade />
          </div>
          
          <div className="flex flex-col lg:flex-row gap-3 md:gap-6">
            {/* Coluna Esquerda - 100% em mobile, 40% em desktop */}
            <div className="w-full lg:w-[40%] space-y-3">
              <CardCliente />
              <GanchoAbertura />
            </div>
            
            {/* Coluna Direita - 100% em mobile, 60% em desktop */}
            <div className="w-full lg:flex-1 space-y-3">
              <ScriptPitch />
              <RecomendacoesEstrategicas />
              <ObjecoesRebatidas />
              <ScriptFechamento />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tela;
