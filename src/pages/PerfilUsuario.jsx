import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Loading from "../components/Loading";
import Error from "../components/Error";

import { fetchProfile, updateProfile } from "../api/users";
import { logoutClient } from "../api/auth";

export default function PerfilUsuario() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ name: "", timezone: "", locale: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState("");

  const timezoneOptions = useMemo(
    () => ["America/Monterrey", "America/Mexico_City", "America/New_York", "Europe/Madrid", "UTC", "Otro (escribe abajo)"],
    []
  );

  const localeOptions = useMemo(() => ["es-MX", "en-US", "es-ES"], []);


  const handleApiError = (err) => {
    const msg = err?.response?.data?.message || err?.message || "Error";
    setError(msg);
  };


  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const p = await fetchProfile();
      setProfile(p);
      setForm({ name: p.name || "", timezone: p.timezone || "UTC", locale: p.locale || "es-MX" });
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const hasChanges = useMemo(() => {
    if (!profile) return false;
    return form.name !== (profile.name || "") || form.timezone !== (profile.timezone || "") || form.locale !== (profile.locale || "");
  }, [form, profile]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!navigator.onLine) {
      alert("Necesitas conexión para guardar cambios.");
      return;
    }
    if (!form.name.trim()) {
      alert("El nombre no puede estar vacío.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await updateProfile({ name: form.name.trim(), timezone: form.timezone, locale: form.locale });
      if (res?.user) {
        setProfile((p) => ({ ...p, ...res.user }));
        setForm((f) => ({ ...f, name: res.user.name, timezone: res.user.timezone, locale: res.user.locale }));
      } else {
        await loadProfile();
      }
      setInfo("Perfil actualizado correctamente.");
      setTimeout(() => setInfo(""), 2000);
    } catch (err) {
      handleApiError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    const ok = window.confirm("¿Cerrar sesión?");
    if (!ok) return;
    logoutClient();
    navigate("/login", { replace: true });
  };

  if (loading) return <Loading />;
  if (error) return <Error error={error} />;

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: "#F7F2EC" }}>
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* Columna izquierda: perfil + logout + preferencias */}
          <div className="space-y-6">
            <div className="p-6 rounded-lg shadow-sm" style={{ backgroundColor: "#E9DBFE" }}>
              <button style={{backgroundColor: "#f3f3f3ff"}} className="w-full px-6 py-3 bg-purple-200 text-purple-800 font-semibold rounded-lg mb-4">
                Mi perfil
              </button>
              <h2 className="text-2xl font-bold text-purple-900 mb-4">{profile?.name}</h2>
              <button
                onClick={handleLogout}
                className="w-full px-6 py-3 bg-red-200 hover:bg-red-300 text-red-800 font-bold rounded-lg"
              >
                Cerrar sesión
              </button>
            </div>

            {/* Preferencias */}
            <div className="p-6 rounded-lg shadow-sm" style={{ backgroundColor: "#E9DBFE" }}>
              <h3 className="text-lg font-bold text-purple-900 mb-2">Preferencias</h3>
              <div className="space-y-2">
                <div>
                  <span className="font-semibold text-purple-800">Idioma: </span>
                  <span className="text-purple-900">{form.locale}</span>
                </div>
                <div>
                  <span className="font-semibold text-purple-800">Zona horaria: </span>
                  <span className="text-purple-900">{form.timezone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha: formulario editar perfil */}
          <div className="space-y-6">
            <div className="p-6 rounded-lg shadow-sm" style={{ backgroundColor: "#E9DBFE" }}>
              <h3 className="text-lg font-bold text-purple-900 mb-4">Información personal</h3>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-purple-800">Nombre</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={onChange}
                    className="w-full px-4 py-3 mt-2 border rounded-lg border-purple-300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-purple-800">Correo</label>
                  <div className="mt-2 text-purple-900">{profile?.email}</div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-purple-800">Zona horaria</label>
                  <select name="timezone" value={form.timezone} onChange={onChange} className="w-full px-4 py-3 mt-2 border rounded-lg border-purple-300">
                    {timezoneOptions.map((tz) => (
                      <option value={tz} key={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                  {form.timezone === "Otro (escribe abajo)" && (
                    <input
                      name="timezone"
                      value={form.timezoneCustom || ""}
                      onChange={(e) => setForm((s) => ({ ...s, timezone: e.target.value }))}
                      placeholder="Asia/Shanghai"
                      className="w-full px-4 py-3 mt-2 border rounded-lg border-purple-300"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-purple-800">Locale</label>
                  <select name="locale" value={form.locale} onChange={onChange} className="w-full px-4 py-3 mt-2 border rounded-lg border-purple-300">
                    {localeOptions.map((l) => (
                      <option value={l} key={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-3 mt-4">
                  <button
                    type="submit"
                    disabled={!hasChanges || saving || !navigator.onLine}
                    className="px-6 py-3 bg-purple-800 text-white font-semibold rounded-lg disabled:opacity-50"
                  >
                    {saving ? "Guardando..." : "Guardar cambios"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ name: profile.name || "", timezone: profile.timezone || "UTC", locale: profile.locale || "es-MX" });
                      setInfo("");
                    }}
                    className="px-4 py-2 bg-purple-200 text-purple-800 rounded-lg"
                  >
                    Cancelar
                  </button>
                </div>

                {info && <div className="mt-3 text-sm text-green-700">{info}</div>}
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
