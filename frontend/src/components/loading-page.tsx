import AppLogo from "./app-logo";
import LoadingSpinner from "./loading-spinner";

export default function LoadingPage() {
	return (
		<div className="flex flex-col justify-center items-center">
			<div className="flex flex-row items-center justify-center mb-8">
				<AppLogo className="w-24 h-24 mr-4" />
			</div>
			<LoadingSpinner />
		</div>
	);
}
