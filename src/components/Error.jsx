export default function Error({ error = "Ocurrió un error inesperado" }) {
  return (
    <div className="min-h-screen bg-[#F7F2EC] flex items-center justify-center">
      <div className="text-red-600 bg-red-50 border border-red-100 p-4 rounded">
        Error: {error}
      </div>
    </div>
  );
}
