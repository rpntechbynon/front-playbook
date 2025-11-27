import React from "react";
import MenuSuperior from "../MenuSuperior";
import { Check, Zap, Sliders } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

export default function Home() {
	const { theme, isDarkMode } = useTheme();
	
	return (
		<>
			<MenuSuperior />
			<main className={`min-h-screen ${theme.bg.primary} flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28`}>
				<section className={`w-full max-w-3xl ${theme.bg.card} ${theme.border.card} border rounded-2xl sm:rounded-3xl ${theme.shadow.card} p-6 sm:p-8 lg:p-12 flex flex-col items-center gap-6 sm:gap-8`}>
					<div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-2 sm:mb-4">
						<div className={`w-12 h-12 sm:w-16 sm:h-16 ${isDarkMode ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-gradient-to-br from-gray-700 to-gray-900'} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg`}>
							<span className="text-white font-black text-2xl sm:text-3xl">P</span>
						</div>
						<h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black ${isDarkMode ? 'bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400' : 'bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900'} bg-clip-text text-transparent text-center tracking-tight`}>
							Bem-vindo ao PlayBook
						</h1>
					</div>
					<p className={`text-base sm:text-lg md:text-xl lg:text-2xl ${theme.text.secondary} text-center leading-relaxed px-2`}>
						Sua plataforma para organização e produtividade. Experimente uma experiência moderna, intuitiva e agradável!
					</p>
					<div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2 sm:mt-4 w-full sm:w-auto">
						<div className={`flex items-center gap-2 px-3 sm:px-4 py-2 ${isDarkMode ? 'bg-blue-600/20 border-blue-500/30' : 'bg-gray-200 border-gray-300'} rounded-xl border`}>
							<Check className={`w-4 h-4 sm:w-5 sm:h-5 ${isDarkMode ? 'text-blue-400' : 'text-gray-700'} flex-shrink-0`} />
							<span className={`${theme.text.secondary} font-medium text-sm sm:text-base`}>Organizado</span>
						</div>
						<div className={`flex items-center gap-2 px-3 sm:px-4 py-2 ${isDarkMode ? 'bg-purple-600/20 border-purple-500/30' : 'bg-gray-200 border-gray-300'} rounded-xl border`}>
							<Zap className={`w-4 h-4 sm:w-5 sm:h-5 ${isDarkMode ? 'text-purple-400' : 'text-gray-700'} flex-shrink-0`} />
							<span className={`${theme.text.secondary} font-medium text-sm sm:text-base`}>Produtivo</span>
						</div>
						<div className={`flex items-center gap-2 px-3 sm:px-4 py-2 ${isDarkMode ? 'bg-pink-600/20 border-pink-500/30' : 'bg-gray-200 border-gray-300'} rounded-xl border`}>
							<Sliders className={`w-4 h-4 sm:w-5 sm:h-5 ${isDarkMode ? 'text-pink-400' : 'text-gray-700'} flex-shrink-0`} />
							<span className={`${theme.text.secondary} font-medium text-sm sm:text-base`}>Intuitivo</span>
						</div>
					</div>
				</section>
				<footer className={`mt-10 ${theme.text.muted} text-sm text-center`}>
					&copy; {new Date().getFullYear()} PlayBook. Todos os direitos reservados.
				</footer>
			</main>
		</>
	);
}
