"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Header } from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EmpresaRow } from "@/types";

export default function EditarEmpresaPage() {
  const router = useRouter();
  const params = useParams<{ cif: string }>();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    password: "",
  });

  useEffect(() => {
    fetch(`/api/admin/empresas/${params.cif}`)
      .then((r) => r.json())
      .then((data: EmpresaRow) => {
        setForm({
          nombre: data.nombre ?? "",
          email: data.email ?? "",
          telefono: data.telefono ?? "",
          direccion: data.direccion ?? "",
          password: "",
        });
      })
      .catch(() => setError("Error al cargar la empresa"))
      .finally(() => setFetching(false));
  }, [params.cif]);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/empresas/${params.cif}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre,
          email: form.email || null,
          telefono: form.telefono || null,
          direccion: form.direccion || null,
          ...(form.password ? { password: form.password } : {}),
        }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setError(data.error ?? "Error al actualizar");
        return;
      }
      setSuccess("Empresa actualizada correctamente");
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle() {
    if (!confirm("¿Confirmas cambiar el estado de esta empresa?")) return;
    try {
      await fetch(`/api/admin/empresas/${params.cif}`, { method: "DELETE" });
      router.push("/admin/clientes");
      router.refresh();
    } catch {
      setError("Error al cambiar estado");
    }
  }

  if (fetching) return <div className="p-8 text-[#64748B]">Cargando...</div>;

  return (
    <div>
      <Header title="Editar empresa" description={`CIF: ${params.cif}`}>
        <Button variant="ghost" size="sm" onClick={() => router.back()}>← Volver</Button>
      </Header>
      <Card className="max-w-xl">
        <CardHeader><CardTitle className="text-base">Actualizar datos</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
            {success && <Alert variant="success"><AlertDescription>{success}</AlertDescription></Alert>}
            <div className="space-y-2">
              <Label htmlFor="nombre">Razón social *</Label>
              <Input id="nombre" value={form.nombre} onChange={(e) => update("nombre", e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input id="telefono" value={form.telefono} onChange={(e) => update("telefono", e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input id="direccion" value={form.direccion} onChange={(e) => update("direccion", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Nueva contraseña (dejar en blanco para no cambiar)</Label>
              <Input id="password" type="password" value={form.password} onChange={(e) => update("password", e.target.value)} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={loading}>{loading ? "Guardando..." : "Guardar cambios"}</Button>
              <Button type="button" variant="destructive" onClick={handleToggle}>Cambiar estado</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
