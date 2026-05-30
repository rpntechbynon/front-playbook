import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { useEffect } from "react";

export default function Toast({ message, type = "success", onClose, duration = 3000 }) {
	useEffect(() => {
		if (duration) {
			const timer = setTimeout(onClose, duration);
			return () => clearTimeout(timer);
		}
	}, [duration, onClose]);

	const styles = {
		success: {
			bg: "bg-green-50",
			border: "border-green-200",
			text: "text-green-800",
			icon: "text-green-600"
		},
		error: {
			bg: "bg-red-50",
			border: "border-red-200",
			text: "text-red-800",
			icon: "text-red-600"
		},
		info: {
			bg: "bg-blue-50",
			border: "border-blue-200",
			text: "text-blue-800",
			icon: "text-blue-600"
		}
	};

	const style = styles[type] || styles.success;
	const Icon = type === "success" ? CheckCircle : type === "error" ? AlertCircle : Info;

	return (
		<div className={`fixed top-20 right-4 z-50 ${style.bg} border ${style.border} rounded-lg p-4 shadow-lg max-w-md animate-in slide-in-from-right duration-300`}>
			<div className="flex items-start gap-3">
				<Icon className={`w-5 h-5 ${style.icon} flex-shrink-0 mt-0.5`} />
				<p className={`${style.text} flex-1 text-sm font-medium`}>{message}</p>
				<button
					onClick={onClose}
					className={`${style.text} hover:opacity-70 transition-opacity`}
				>
					<X className="w-4 h-4" />
				</button>
			</div>
			{duration && (
				<div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
					<div 
						className={`h-full ${type === "success" ? "bg-green-500" : type === "error" ? "bg-red-500" : "bg-blue-500"}`}
						style={{ 
							animation: `shrink ${duration}ms linear`,
							transformOrigin: 'left'
						}}
					/>
				</div>
			)}
		</div>
	);
}
