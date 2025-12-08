import AppLogo from './app-logo';
import LoadingSpinner from './loading-spinner';

export default function LoadingPage() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
			<AppLogo className="w-24 h-24 mb-8" />
			<LoadingSpinner />
		</div>
	);
}
