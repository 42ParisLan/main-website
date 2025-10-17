export default function ErrorPage({ error }: { error: string }) {
	return (
		<div className="flex flex-col items-center justify-center size-full">
			<div className="text-center">
				<img
					src="/dancing_gopher.gif"
					alt="Error"
					className="w-32 h-32 mx-auto"
				/>
				<br />
				<h1 className="text-3xl font-bold text-red-500">Whoops!</h1>
				<p className="text-gray-500">{error}</p>
			</div>
		</div>
	);
}