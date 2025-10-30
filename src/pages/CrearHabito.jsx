import React, { useEffect, useState } from "react"; 
import { useNavigate, useParams } from "react-router-dom";
import Loading from "../components/Loading";
import Error from "../components/Error";

import { fetchHabits, createHabit, updateHabit, deleteHabit } from "../api/habits";

export default function CrearHabito() {
  const navigate = useNavigate();
  const { id: habitIdParam } = useParams(); 

  const [loading, setLoading] = useState(Boolean(habitIdParam));
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    frequency: "Diario",
    recordatorioEnabled: false,
    recordatorioTime: "08:00",
    icon: "",
    motivation: ""
  });

  const ICONS = ["💧", "🧘", "📚", "🏃", "💤", "🥗", "💪", "🎯", "🌟", "🔥", "⚡", "🎨"];

  const handleApiError = (err) => {
    const status = err?.response?.status;
    const msg = err?.response?.data?.message || err.message || "Error";
    if (status === 401 || status === 403) {
      alert("Tu sesión expiró o no tienes permisos. Serás redirigido al login.");
      localStorage.removeItem("token");
      navigate("/login", { replace: true });
      return;
    }
    setError(msg);
  };

  useEffect(() => {
    if (!habitIdParam) {
      setLoading(false);
      return;
    }

    let mounted = true;
    const loadHabit = async () => {
      setLoading(true);
      setError(null);
      try {
        const all = await fetchHabits(); 
        if (!mounted) return;
        const found = all.find((h) => String(h._id) === String(habitIdParam));
        if (!found) {
          setError("Hábito no encontrado para editar.");
          return;
        }
        setForm({
          title: found.title || "",
          description: found.description || "",
          frequency: found.frequency || "Diario",
          recordatorioEnabled: !!(found.recordatorio && found.recordatorio.enabled),
          recordatorioTime: (found.recordatorio && found.recordatorio.time) || "08:00",
          icon: found.icon || "",
          motivation: found.motivation || ""
        });
      } catch (err) {
        handleApiError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadHabit();
    return () => { mounted = false; };
  }, [habitIdParam]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleIconSelect = (icon) => {
    setForm((p) => ({ ...p, icon }));
  };

  const validate = () => {
    if (!form.title.trim()) {
      setError("El nombre del hábito es requerido.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!navigator.onLine) {
      setError("Necesitas conexión a Internet para guardar cambios.");
      return;
    }

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        title: form.title,
        description: form.description || "",
        frequency: form.frequency,
        recordatorio: { enabled: !!form.recordatorioEnabled, time: form.recordatorioTime || "08:00" },
        icon: form.icon || "",
        motivation: form.motivation || ""
      };

      if (habitIdParam) {
        await updateHabit(habitIdParam, payload);
        navigate("/dashboard", { replace: true });
      } else {
        await createHabit(payload);
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!habitIdParam) return;
    const confirm = window.confirm("¿Seguro que quieres eliminar (archivar) este hábito? Esta acción se puede revertir editando el hábito.");
    if (!confirm) return;

    if (!navigator.onLine) {
      setError("Necesitas conexión a Internet para eliminar el hábito.");
      return;
    }

    setIsSubmitting(true);
    try {
      await deleteHabit(habitIdParam);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error error={error} />;

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#F7F2EC" }}>
      <div className="max-w-4xl mx-auto">
        <div className="p-8 rounded-lg shadow-sm" style={{ backgroundColor: "#FFF2A8" }}>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{habitIdParam ? "Editar hábito" : "Agregar nuevo hábito"}</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-semibold text-gray-800">Nombre</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full px-4 py-3 mt-2 border rounded-lg focus:outline-none border-gray-400"
                placeholder="Ej: Beber agua"
                required
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-semibold text-gray-800">Descripción (opcional)</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="w-full px-4 py-3 mt-2 border rounded-lg resize-none h-20 border-gray-400"
                placeholder="Descripción breve del hábito"
              />
            </div>

            {/* Frecuencia y recordatorio */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-800">Frecuencia</label>
                <select
                  name="frequency"
                  value={form.frequency}
                  onChange={handleChange}
                  className="w-full px-4 py-3 mt-2 border rounded-lg border-gray-400"
                >
                  <option value="Diario">Diario</option>
                  <option value="Semanal">Semanal</option>
                  <option value="Mensual">Mensual</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-800">Recordatorio</label>
                <div className="mt-2 flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="recordatorioEnabled"
                    checked={form.recordatorioEnabled}
                    onChange={handleChange}
                    className="w-5 h-5"
                  />
                  <input
                    type="time"
                    name="recordatorioTime"
                    value={form.recordatorioTime}
                    onChange={handleChange}
                    className="px-3 py-2 border rounded-lg border-gray-400"
                    disabled={!form.recordatorioEnabled}
                  />
                </div>
              </div>
            </div>

            {/* Iconos */}
            <div>
              <label className="block text-sm font-semibold text-gray-800">Icono (opcional)</label>
              <div className="grid grid-cols-8 gap-2 mt-2">
                {ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => handleIconSelect(ic)}
                    className={`w-10 h-10 text-2xl rounded-lg flex items-center justify-center border ${
                      form.icon === ic ? "border-indigo-600 bg-indigo-100" : "border-gray-400"
                    }`}
                  >
                    {ic}
                  </button>
                ))}
              </div>
              {form.icon && <div className="text-sm text-gray-700 mt-2">Icono seleccionado: {form.icon}</div>}
            </div>

            {/* Motivación */}
            <div>
              <label className="block text-sm font-semibold text-gray-800">Motivación (opcional)</label>
              <textarea
                name="motivation"
                value={form.motivation}
                onChange={handleChange}
                className="w-full px-4 py-3 mt-2 border rounded-lg resize-none h-16 border-gray-400"
                placeholder="¿Por qué quieres hacer este hábito?"
              />
            </div>

            {/* Mensaje de error */}
            {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}

            <div className="flex items-center justify-between space-x-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold disabled:opacity-50"
              >
                {isSubmitting ? "Guardando..." : habitIdParam ? "Guardar cambios" : "Crear hábito"}
              </button>

              {habitIdParam && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold disabled:opacity-50"
                >
                  {isSubmitting ? "..." : "Eliminar hábito"}
                </button>
              )}

              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
