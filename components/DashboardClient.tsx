"use client";

interface DashboardClientProps {
  role: string;
}

export default function DashboardClient({ role }: DashboardClientProps) {
  return (
      <div>
        <h1>Bienvenido al Dashboard</h1>

        {/* Mostrar mensaje basado en el rol */}
        {role === "admin" ? (
          <p>Solo lo ves si eres admin</p>
        ) : role === "user" ? (
          <p>Solo lo ves si eres user</p>
        ) : role === "client" ? (
          <p>Solo lo ves si eres cliente</p>
        ) : (
          <p>No tienes permisos para ver esta página</p> // Caso para cualquier rol desconocido
        )}
      </div>
  );
}
