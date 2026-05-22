"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NuevaEmpresaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    cif: "",
    nombre: "",
    email: "",
    telefono: "",
    direccion: "",
    password: "",
    confirmPassword: "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    const cifRegex = /^[A-Za-z]\d{7}[A-Za-z0-9]$/;
    if (!cifRegex.test(form.cif)) {
      setError("CIF inválido. Formato: letra + 7 dígitos + dígito/letra");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/empresas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cif: form.cif.toUpperCase(),
          nombre: form.nombre,
          email: form.email || undefined,
          telefono: form.telefono || undefined,
          direccion: form.direccion || undefined,
          password: form.password,
        }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setError(data.error ?? "Error al crear la empresa");
        return;
      }

      router.push("/admin/clientes");
      router.refresh();
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Header title="Nueva empresa" description="Registra un nuevo cliente en la gestoría" />
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="text-base">Datos de la empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cif">CIF *</Label>
                <Input id="cif" value={form.cif} onChange={(e) => update("cif", e.target.value)} placeholder="B12345678" required className="font-mono uppercase" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nombre">Razón social *</Label>
                <Input id="nombre" value={form.nombre} onChange={(e) => update("nombre", e.target.value)} placeholder="Empresa S.L." required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="contacto@empresa.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input id="telefono" value={form.telefono} onChange={(e) => update("telefono", e.target.value)} placeholder="912345678" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input id="direccion" value={form.direccion} onChange={(e) => update("direccion", e.target.value)} placeholder="Calle Mayor 1, Madrid" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña *</Label>
                <Input id="password" type="password" value={form.password} onChange={(e) => update("password", e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirmar contraseña *</Label>
                <Input id="confirm" type="password" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} required />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={loading}>{loading ? "Creando..." : "Crear empresa"}</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
