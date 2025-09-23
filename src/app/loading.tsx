import { LoadingState } from "@/components/ui/loading-state"

export default function Loading() {
  return (
    <div className="container mx-auto py-8">
      <LoadingState message="Loading, please wait while we connect to the database..." />
    </div>
  )
}
