export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200">
      {/* Spinner */}
      <div className="relative mb-6">
        <div className="w-16 h-16 border-4 border-orange-200 rounded-full" />
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-orange-500 rounded-full border-t-transparent animate-spin" />
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold text-orange-800">
        Academia Saúde Cabuçu
      </h1>
      <p className="mt-2 text-sm text-orange-600 animate-pulse">
        Carregando...
      </p>
    </div>
  );
}
