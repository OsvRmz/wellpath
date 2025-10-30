import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DateTime } from "luxon";

import Loading from "../components/Loading";
import Error from "../components/Error";

import { fetchWeekStats, fetchMonthStats } from "../api/stats";
import { fetchHabits } from "../api/habits";
import { fetchHabitHistoryRange } from "../api/habitHistory";
import { fetchDashboard } from "../api/dashboard";
import { fetchProfile } from "../api/users";

export default function Estadisticas() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [profile, setProfile] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [weekStats, setWeekStats] = useState(null);
  const [monthStats, setMonthStats] = useState([]);
  const [habits, setHabits] = useState([]);
  const [analisisHabitos, setAnalisisHabitos] = useState([]);
  const [tab, setTab] = useState("semana");


  const handleApiError = (err) => {
    const msg = err?.response?.data?.message || err?.message || "Error";
    setError(msg);
  };


  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const prof = await fetchProfile();
        if (!mounted) return;
        setProfile(prof);

        const dash = await fetchDashboard();
        if (!mounted) return;
        setDashboard(dash);

        const w = await fetchWeekStats();
        if (!mounted) return;
        setWeekStats(w);

        const m = await fetchMonthStats();
        if (!mounted) return;
        setMonthStats(m || []);

        const hs = await fetchHabits();
        if (!mounted) return;
        setHabits(hs || []);

        const tz = prof?.timezone || "UTC";
        const mondayThis = DateTime.now().setZone(tz).startOf("week").toISODate();
        const mondayPrev = DateTime.fromISO(mondayThis, { zone: tz }).minus({ days: 7 }).toISODate();

        const startThis = mondayThis;
        const endThis = DateTime.fromISO(mondayThis, { zone: tz }).plus({ days: 6 }).toISODate();
        const startPrev = mondayPrev;
        const endPrev = DateTime.fromISO(mondayPrev, { zone: tz }).plus({ days: 6 }).toISODate();

        const [histThis, histPrev] = await Promise.all([
          fetchHabitHistoryRange(startThis, endThis),
          fetchHabitHistoryRange(startPrev, endPrev),
        ]);
        if (!mounted) return;

        const mapThis = {};
        histThis.forEach((r) => {
          if (!mapThis[r.date]) mapThis[r.date] = new Set();
          if (r.completed) mapThis[r.date].add(r.habitId.toString());
        });

        const mapPrev = {};
        histPrev.forEach((r) => {
          if (!mapPrev[r.date]) mapPrev[r.date] = new Set();
          if (r.completed) mapPrev[r.date].add(r.habitId.toString());
        });

        const diasThis = Array.from({ length: 7 }).map((_, i) =>
          DateTime.fromISO(mondayThis, { zone: tz }).plus({ days: i }).toISODate()
        );
        const diasPrev = Array.from({ length: 7 }).map((_, i) =>
          DateTime.fromISO(mondayPrev, { zone: tz }).plus({ days: i }).toISODate()
        );

        const analisis = (hs || []).map((h) => {
          const compThis = diasThis.reduce(
            (acc, d) => acc + (mapThis[d]?.has(h._id.toString()) ? 1 : 0),
            0
          );
          const compPrev = diasPrev.reduce(
            (acc, d) => acc + (mapPrev[d]?.has(h._id.toString()) ? 1 : 0),
            0
          );
          const pctThis = Math.round((compThis / 7) * 100);
          const pctPrev = Math.round((compPrev / 7) * 100);
          const delta = pctThis - pctPrev;
          const tendencia = delta > 3 ? "up" : delta < -3 ? "down" : "stable";
          return {
            id: h._id,
            nombre: h.title,
            completados: compThis,
            total: 7,
            porcentaje: pctThis,
            tendencia,
          };
        });

        setAnalisisHabitos(analisis);
      } catch (err) {
        handleApiError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    const onFocus = () => load();
    const onVis = () => {
      if (document.visibilityState === "visible") load();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      mounted = false;
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [navigate]);

  if (loading) return <Loading />;
  if (error) return <Error error={error} />;

  const noHabits = !habits || habits.length === 0;
  const noWeekData = !weekStats?.porDia || weekStats.porDia.length === 0;
  const noMonthData = !monthStats || monthStats.length === 0;

  return (
    <div className="min-h-screen bg-[#F7F2EC] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Estadísticas</h2>
          <p className="text-sm text-gray-600">
            {profile ? `Zona horaria: ${profile.timezone || "UTC"}` : ""}
          </p>
        </div>

        {/* Grid principal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-[#F7F2EC] p-2 min-h-[calc(100vh-120px)] overflow-y-auto">
          {/* Columna izquierda */}
          <div className="space-y-6">
            {[{
              title: "Progreso general",
              content: (
                <>
                  Has completado el{" "}
                  <span className="font-bold text-2xl text-gray-800">
                    {Math.round(weekStats?.progresoGeneral || 0)}%
                  </span>{" "}
                  de tus hábitos esta semana
                  <p className="text-xs text-gray-500">Promedio diario: {weekStats?.promedioDiario || 0}</p>
                </>
              )
            },{
              title: "Racha activa",
              content: (
                <>
                  <span className="font-bold text-3xl text-gray-800">{dashboard?.streak ?? 0}</span>{" "}
                  días consecutivos cumpliendo al menos 1 hábito
                </>
              )
            },{
              title: "Promedio diario",
              content: (
                <>
                  Cumples en promedio{" "}
                  <span className="font-bold text-2xl text-gray-800">{weekStats?.promedioDiario || 0}</span> de tus{" "}
                  <span className="font-bold text-xl text-gray-800">{habits.length || 0}</span> hábitos diarios
                </>
              )
            }].map((card, i) => (
              <div key={i} className="bg-[#CEF8CA] p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-2">{card.title}</h3>
                <p className="text-gray-700">{card.content}</p>
              </div>
            ))}
          </div>

          {/* Columna derecha */}
          <div className="space-y-6">
            {/* Gráficas */}
            <div className="bg-[#CEF8CA] p-6 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800">Gráficas de evolución</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setTab("semana")}
                    className={`px-3 py-1 rounded-lg font-semibold ${tab === "semana" ? "bg-yellow-200 text-gray-900" : "bg-gray-200 text-gray-600"}`}
                  >
                    Semanal
                  </button>
                  <button
                    onClick={() => setTab("mes")}
                    className={`px-3 py-1 rounded-lg font-semibold ${tab === "mes" ? "bg-yellow-200 text-gray-900" : "bg-gray-200 text-gray-600"}`}
                  >
                    Mensual
                  </button>
                </div>
              </div>

              {tab === "semana" ? (
                noWeekData || noHabits ? (
                  <div className="text-sm text-gray-600">No hay datos — registra hábitos primero.</div>
                ) : (
                  weekStats.porDia.map((dia, idx) => (
                    <div key={idx} className="space-y-1 mb-2">
                      <div className="flex justify-between text-sm text-gray-700">
                        <span className="font-medium">{dia.weekdayName}</span>
                        <span className="font-bold">{dia.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-pink-300 to-pink-500 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${dia.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))
                )
              ) : tab === "mes" ? (
                noMonthData || noHabits ? (
                  <div className="text-sm text-gray-600">No hay datos — registra hábitos primero.</div>
                ) : (
                  monthStats.map((sem, idx) => (
                    <div key={idx} className="space-y-1 mb-2">
                      <div className="flex justify-between text-sm text-gray-700">
                        <span className="font-medium">{sem.etiqueta || sem.semanaLabel || `Semana ${idx + 1}`}</span>
                        <span className="font-bold">{sem.porcentaje}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-indigo-300 to-indigo-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${sem.porcentaje}%` }}
                        />
                      </div>
                    </div>
                  ))
                )
              ) : null}
            </div>

            {/* Análisis por hábito */}
            <div className="bg-[#CEF8CA] p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Análisis por hábito</h3>
              {noHabits ? (
                <p className="text-sm text-gray-600">Agrega hábitos para ver su desempeño.</p>
              ) : (
                analisisHabitos.map((h) => (
                  <div key={h.id} className="bg-white p-4 rounded-lg mb-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-800">{h.nombre}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{h.completados}/{h.total} días</span>
                        <span className="font-bold text-gray-800">{h.porcentaje}%</span>
                        {h.tendencia === "up" && <span className="text-green-500 text-lg">▲</span>}
                        {h.tendencia === "down" && <span className="text-red-500 text-lg">▼</span>}
                        {h.tendencia === "stable" && <span className="text-yellow-500 text-lg">●</span>}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-gradient-to-r from-green-300 to-green-500 h-2 rounded-full" style={{ width: `${h.porcentaje}%` }} />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Retroalimentación */}
            <div className="bg-[#CEF8CA] p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Retroalimentación</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                {weekStats?.progresoGeneral >= 80
                  ? "¡Excelente! Tu constancia está sólida. Mantén la racha."
                  : weekStats?.progresoGeneral >= 50
                  ? "Vas bien, hay margen de mejora. Identifica 1–2 hábitos para reforzar."
                  : "Estás empezando. Empieza con 2–3 hábitos clave y horarios fijos."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
