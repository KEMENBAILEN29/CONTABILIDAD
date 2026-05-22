import { Header } from "@/components/shared/Header"
import { SelectorInforme } from "@/components/informes/SelectorInforme"

export default function InformesPage() {
  return (
    <div>
      <Header
        title="Informes"
        description="Genera y descarga tus informes financieros en PDF"
      />
      <SelectorInforme />
    </div>
  )
}
