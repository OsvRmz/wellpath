import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DateTime } from "luxon";

import Loading from "../components/Loading";
import Error from "../components/Error";

import { fetchProfile } from "../api/users";
import { fetchHabits } from "../api/habits";
import { fetchHabitHistoryRange, upsertHabitHistory } from "../api/habitHistory";

export default function Historial() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [habits, setHabits] = useState([]);
  const [histories, setHistories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedISO, setSelectedISO] = useState(null);
  const [busyHabitId, setBusyHabitId] = useState(null);


  const handleApiError = (err) => {
    const msg = err?.response?.data?.message || err?.message || "Error";
    setError(msg);
  };


  const startOfMonday = (d0 = DateTime.now(), tz = "UTC") => {
    const d = d0.setZone(tz).startOf("day");
    const weekday = d.weekday;
    const daysFromMonday = (weekday + 6) % 7;
    return d.minus({ days: daysFromMonday }).startOf("day");
  };

  const rangeDaysISO = (mondayDt) => Array.from({ length: 7 }).map((_, i) => mondayDt.plus({ days: i }).toISODate());

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const prof = await fetchProfile();
      setProfile(prof);
      const tz = prof?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

      const mondayDt = startOfMonday(DateTime.now(), tz);
      const daysISO = rangeDaysISO(mondayDt);
      const startISO = daysISO[0];
      const endISO = daysISO[6];

      const [hs, historiesRes] = await Promise.all([
        fetchHabits(),
        fetchHabitHistoryRange(startISO, endISO),
      ]);
      setHabits(hs || []);
      setHistories(historiesRes || []);

      const todayISO = DateTime.now().setZone(tz).toISODate();
      setSelectedISO(daysISO.includes(todayISO) ? todayISO : startISO);
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    if (!mounted) return;

    loadAll();

    const onFocus = () => loadAll();
    const onVis = () => {
      if (document.visibilityState === "visible") loadAll();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVis);

    return () => {
      mounted = false;
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const weekInfo = useMemo(() => {
    const tz = profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
    const monday = startOfMonday(DateTime.now(), tz);
    const days = rangeDaysISO(monday);
    const weekdayNames = days.map((iso) =>
      DateTime.fromISO(iso).setZone(tz).toLocaleString({ weekday: "short" })
    );
    return { tz, mondayISO: days[0], days, weekdayNames };
  }, [profile]);

  const historyMap = useMemo(() => {
    const map = {};
    for (const rec of histories) {
      if (!map[rec.date]) map[rec.date] = {};
      map[rec.date][rec.habitId.toString()] = rec;
    }
    return map;
  }, [histories]);

  const weekStats = useMemo(() => {
    const total = habits.length;
    return weekInfo.days.map((d) => {
      const dateMap = historyMap[d] || {};
      const completedCount = Object.values(dateMap).filter((r) => r.completed).length;
      const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;
      return { date: d, weekdayName: DateTime.fromISO(d).toLocaleString({ weekday: "long" }), percentage: percent, completedCount };
    });
  }, [habits, historyMap, weekInfo.days]);

  const dayStats = useMemo(() => {
    const date = selectedISO;
    if (!date) return { total: habits.length, completed: 0, percentage: 0, map: {} };
    const mapa = historyMap[date] || {};
    const completed = Object.values(mapa).filter((r) => r.completed).length;
    const percentage = habits.length > 0 ? Math.round((completed / habits.length) * 100) : 0;
    return { total: habits.length, completed, percentage, map: mapa };
  }, [selectedISO, habits, historyMap]);

  const toggleHabit = async (habitId) => {
    if (!navigator.onLine) {
      alert("Necesitas conexión para registrar cambios.");
      return;
    }
    setBusyHabitId(habitId);
    try {
      const current = (historyMap[selectedISO] || {})[habitId];
      const newCompleted = !current?.completed;
      await upsertHabitHistory({ habitId, date: selectedISO, completed: newCompleted });
      const mondayISO = weekInfo.mondayISO;
      const endISO = DateTime.fromISO(mondayISO).plus({ days: 6 }).toISODate();
      const refreshed = await fetchHabitHistoryRange(mondayISO, endISO);
      setHistories(refreshed || []);
    } catch (err) {
      handleApiError(err);
    } finally {
      setBusyHabitId(null);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error error={error} />;

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#F7F2EC" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Historial</h2>
          <p className="text-sm text-gray-600">
            Semana del{" "}
            {DateTime.fromISO(weekInfo.mondayISO).setZone(weekInfo.tz).toLocaleString({
              day: "2-digit",
              month: "short",
              year: "numeric"
            })}{" "}
            al{" "}
            {DateTime.fromISO(weekInfo.days[6]).setZone(weekInfo.tz).toLocaleString({
              day: "2-digit",
              month: "short",
              year: "numeric"
            })}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Columna izquierda: Progreso semanal */}
          <div className="space-y-6">
            <div className="p-6 rounded-lg shadow-sm" style={{ backgroundColor: "#B7F2FF" }}>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Progreso semanal</h3>
              <div className="space-y-3">
                {weekStats.map((d) => (
                  <div key={d.date} className="space-y-1">
                    <div className="flex justify-between text-sm text-gray-700">
                      <span className="font-medium">{DateTime.fromISO(d.date).setZone(weekInfo.tz).toFormat("ccc")}</span>
                      <span className="font-bold">{d.percentage}%</span>
                    </div>
                    <div className="w-full bg-white rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-pink-300 to-pink-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${d.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Columna derecha: Selección de día y hábitos */}
          <div className="space-y-6">
            <div className="p-6 rounded-lg shadow-sm" style={{ backgroundColor: "#B7F2FF" }}>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Seleccionar día</h3>
              <div className="flex flex-wrap gap-2">
                {weekInfo.days.map((iso) => {
                  const diaNum = DateTime.fromISO(iso).setZone(weekInfo.tz).day;
                  const activo = iso === selectedISO;
                  return (
                    <button
                      key={iso}
                      onClick={() => setSelectedISO(iso)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                        activo ? "bg-yellow-300 text-gray-800 shadow-lg" : "bg-white text-gray-600 hover:bg-gray-100"
                      }`}
                      title={DateTime.fromISO(iso).setZone(weekInfo.tz).toLocaleString({ weekday: "long" })}
                    >
                      {diaNum}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-6 rounded-lg shadow-sm" style={{ backgroundColor: "#B7F2FF" }}>
              <h3 className="text-lg font-bold text-gray-800 mb-2 capitalize">
                {DateTime.fromISO(selectedISO).setZone(weekInfo.tz).toLocaleString({
                  weekday: "long",
                  day: "2-digit",
                  month: "long",
                  year: "numeric"
                })}
              </h3>
              <p className="text-gray-700 mb-1">
                Progreso:{" "}
                <span className="font-bold text-2xl text-gray-800">
                  {dayStats.completed}/{dayStats.total}
                </span>{" "}
                hábitos ({dayStats.percentage}%)
              </p>
              <p className="text-xs text-gray-500">Haz clic en un hábito para marcar/desmarcar.</p>
            </div>

            <div className="p-6 rounded-lg shadow-sm" style={{ backgroundColor: "#B7F2FF" }}>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Hábitos</h3>

              {habits.length === 0 ? (
                <p className="text-sm text-gray-600">No hay hábitos registrados. Ve a “Agregar hábito” para crear algunos.</p>
              ) : (
                <div className="space-y-3">
                  {habits.map((h) => {
                    const done = !!(historyMap[selectedISO] || {})[h._id?.toString()]?.completed;
                    return (
                      <div
                        key={h._id}
                        onClick={() => toggleHabit(h._id)}
                        className={`flex items-center p-3 rounded-lg transition-colors cursor-pointer ${
                          done ? "bg-green-100 border-2 border-green-300" : "bg-red-100 border-2 border-red-300"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              done ? "bg-green-500 border-green-500 text-white" : "bg-white border-red-500"
                            }`}
                          >
                            {done && <span className="text-sm">✓</span>}
                          </div>
                          <span className={`font-medium ${done ? "text-green-800" : "text-red-800"}`}>{h.title}</span>
                        </div>
                        <div className="ml-auto text-sm text-gray-600">{h.frequency}</div>
                        {busyHabitId === h._id && <div className="ml-3 text-sm text-gray-500">...</div>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="p-6 rounded-lg shadow-sm" style={{ backgroundColor: "#B7F2FF" }}>
              <p className="text-sm text-gray-700 text-center">
                {dayStats.percentage >= 80
                  ? "¡Excelente disciplina! Mantén el ritmo 💪"
                  : dayStats.percentage >= 50
                  ? "¡Vas bien! Un empujón más y superas el 80% ✨"
                  : "Pequeños pasos diarios. Elige 2 hábitos clave para hoy 🙌"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
