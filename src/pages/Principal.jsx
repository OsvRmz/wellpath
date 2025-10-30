import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DateTime } from "luxon";

import { fetchDashboard } from "../api/dashboard";
import { fetchHabits } from "../api/habits";
import { upsertHabitHistory } from "../api/habitHistory";
import { fetchProfile } from "../api/users";

import Loading from "../components/Loading";
import Error from "../components/Error";

export default function Principal() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [habits, setHabits] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState(null);
  const [infoMessage, setInfoMessage] = useState("");

  const handleApiError = (err) => {
    const msg = err?.response?.data?.message || err?.message || "Error";
    setError(msg);
  };


  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prof, dash, hs] = await Promise.all([fetchProfile(), fetchDashboard(), fetchHabits()]);
      setProfile(prof);
      setDashboard(dash);
      setHabits(hs);
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

  const todayISO = (() => {
    try {
      const tz = profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      return DateTime.now().setZone(tz).toISODate();
    } catch {
      return new Date().toISOString().slice(0, 10);
    }
  })();

  const handleMarkHabit = async (habitId) => {
    if (!habitId) {
      alert("No se encontró el identificador del hábito para marcar.");
      return;
    }

    if (!navigator.onLine) {
      alert("Necesitas conexión para marcar hábitos.");
      return;
    }

    setBusyId(habitId);
    setInfoMessage("");
    try {
      await upsertHabitHistory({ habitId, date: todayISO, completed: true });
      const dash = await fetchDashboard();
      setDashboard(dash);
      setInfoMessage("Hábito marcado correctamente.");
      const hs = await fetchHabits();
      setHabits(hs);
    } catch (err) {
      handleApiError(err);
    } finally {
      setBusyId(null);
      setTimeout(() => setInfoMessage(""), 2000);
    }
  };

  const handleMarkByTitle = async (title) => {
    const found = habits.find((h) => h.title === title);
    if (!found) {
      alert("No se pudo encontrar el hábito para marcar (mismo título). Ve a Historial para marcar manualmente.");
      return;
    }
    await handleMarkHabit(found._id);
  };

  if (loading) return <Loading />;

  if (error) return <Error error={error} />;

  const {
    name = "Usuario",
    totalHabits = 0,
    habitsCompletedToday = 0,
    percentageToday = 0,
    remainingHabits = [],
    streak = 0,
    message = ""
  } = dashboard || {};

  function Donut({ percentage = 0, size = 180, stroke = 16 }) {
    const radius = (size - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const clamped = Math.max(0, Math.min(100, Math.round(percentage)));
    const offset = circumference - (clamped / 100) * circumference;

    return (
      <div className="flex items-center justify-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <linearGradient id="donutGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7E5E48" />
              <stop offset="100%" stopColor="#C69C79" />
            </linearGradient>
          </defs>

          <circle cx={size / 2} cy={size / 2} r={radius} stroke="#eee" strokeWidth={stroke} fill="none" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#donutGrad)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            fill="none"
          />
          <text
            x="50%"
            y="50%"
            dominantBaseline="middle"
            textAnchor="middle"
            className="text-gray-800"
            style={{ fontSize: size * 0.16, fontWeight: 700 }}
          >
            {clamped}%
          </text>
        </svg>
      </div>
    );
  }

  // colores solicitados
  const pageBg = "#F7F2EC";
  const cardBg = "#FBCEE9";

  return (
    // fondo del componente
    <div style={{ backgroundColor: pageBg }} className="min-h-screen p-6">
      {/* contenedor central con scroll interno y scrollbar a la izquierda */}
      <div
        style={{
          maxWidth: "80rem",
          margin: "0 auto",
          height: "calc(100vh - 48px)", // ocupa la ventana menos algo de padding
          overflowY: "auto",
          direction: "rtl" // esto hace que la scrollbar aparezca a la izquierda
        }}
      >
        {/* restauramos direction para el contenido real */}
        <div style={{ direction: "ltr" }}>
          <div className="mx-auto" style={{ maxWidth: "80rem" }}>
            {/* header */}
            <div style={{ backgroundColor: cardBg }} className="p-6 mb-8 mx-auto rounded-lg">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                ¡Hola, {name}! Has completado {habitsCompletedToday} de tus {totalHabits} hábitos hoy
              </h2>
            </div>

            {/* grid */}
            <div
              style={{ backgroundColor: pageBg }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* columna izquierda */}
              <div className="space-y-6">
                <div style={{ backgroundColor: cardBg }} className="p-6 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Calendario</h3>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-800 mb-2">
                      {DateTime.fromISO(todayISO).toLocaleString({ day: "numeric", month: "long" })}
                    </div>
                    <div className="text-sm text-gray-600">
                      {DateTime.fromISO(todayISO).toLocaleString({ weekday: "long", year: "numeric" })}
                    </div>
                  </div>
                </div>

                <div style={{ backgroundColor: cardBg }} className="p-6 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Hábitos restantes hoy</h3>

                  {totalHabits === 0 ? (
                    <div className="text-sm text-gray-700">
                      Aún no tienes hábitos.{" "}
                      <button
                        onClick={() => navigate("/dashboard/crear-habito")}
                        className="underline font-semibold text-gray-900"
                      >
                        Crear hábito
                      </button>
                    </div>
                  ) : remainingHabits.length === 0 ? (
                    <div className="text-sm text-gray-700">¡Todo listo por hoy! 🎉</div>
                  ) : (
                    <ul className="space-y-3">
                      {remainingHabits.map((title, idx) => (
                        <li
                          key={idx}
                          style={{ backgroundColor: "rgba(255,255,255,0.6)" }}
                          className="p-3 rounded-lg text-sm text-gray-700 flex justify-between items-center"
                        >
                          <span>{title}</span>
                          <div>
                            <button
                              onClick={() => handleMarkByTitle(title)}
                              disabled={busyId !== null}
                              className="px-3 py-1 bg-gray-800 text-white rounded-lg text-sm disabled:opacity-50"
                              title="Marcar como completado"
                            >
                              {busyId ? "..." : "Marcar"}
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* columna central */}
              <div className="space-y-6">
                <div style={{ backgroundColor: cardBg }} className="p-6 text-center rounded-lg">
                  <h3 className="text-lg font-bold text-gray-800 mb-6">Progreso general</h3>
                  <div className="flex justify-center mb-4">
                    <Donut percentage={percentageToday || 0} size={200} stroke={20} />
                  </div>
                  <div className="text-3xl font-bold text-gray-800 mb-2">{percentageToday || 0}%</div>
                  <button
                    onClick={() => navigate("/dashboard/historial")}
                    className="w-full px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg mt-4"
                  >
                    Habit Tracker
                  </button>
                  {infoMessage && <div className="mt-3 text-sm text-green-700">{infoMessage}</div>}
                </div>
              </div>

              {/* columna derecha */}
              <div className="space-y-6">
                <div style={{ backgroundColor: cardBg }} className="p-6 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Racha</h3>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-800 mb-2">{streak || 0}</div>
                    <div className="text-sm text-gray-600 mb-2">
                      Has mantenido tu racha durante {streak || 0} {streak === 1 ? "día" : "días"}
                    </div>
                  </div>
                </div>

                <div style={{ backgroundColor: cardBg }} className="p-6 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Retroalimentación</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{message}</p>
                </div>
              </div>
            </div>
            {/* fin grid */}
          </div>
        </div>
      </div>
    </div>
  );
}
