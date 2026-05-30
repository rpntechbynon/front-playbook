import MenuSuperior from '../MenuSuperior';
import { BookOpen, Target, TrendingUp, Users } from 'lucide-react';

const Home = () => {
  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <MenuSuperior />
      
      <div className="flex-1 overflow-auto pt-14">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          {/* Hero Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-12 mb-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500 rounded-full mb-4">
                <span className="text-white font-bold text-2xl">P</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Bem-vindo ao PlayBook
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                Sua plataforma para organização e produtividade
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-gray-700" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Organizado</h3>
              <p className="text-sm text-gray-600">
                Mantenha tudo estruturado e acessível
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-gray-700" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Focado</h3>
              <p className="text-sm text-gray-600">
                Concentre-se no que realmente importa
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-gray-700" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Produtivo</h3>
              <p className="text-sm text-gray-600">
                Aumente sua eficiência no dia a dia
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-gray-700" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Colaborativo</h3>
              <p className="text-sm text-gray-600">
                Trabalhe melhor em equipe
              </p>
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Comece sua jornada
            </h2>
            <p className="text-gray-600 mb-6">
              Explore as funcionalidades do PlayBook e descubra como podemos ajudar você a alcançar seus objetivos de forma mais eficiente e organizada.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium">
                Começar agora
              </button>
              <button className="px-6 py-3 bg-gray-100 text-gray-900 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                Saiba mais
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 py-4">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} PlayBook. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
