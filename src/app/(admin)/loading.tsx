import { LoadingSpinner } from "@/components/shared/LoadingSpinner"

export default function Loading() {
  return (
    <div className="flex h-full items-center justify-center py-16">
      <LoadingSpinner className="h-8 w-8" />
    </div>
  )
}
