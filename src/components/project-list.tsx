import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { api } from "@/trpc/react"
import { LoadingState } from "./ui/loading-state"
import { Button } from "./ui/button"
import { ReloadIcon } from "@radix-ui/react-icons"

export function ProjectList() {
  const [retryCount, setRetryCount] = useState(0)
  const { data: projects, isLoading, isError, error, refetch } = api.project.getProjects.useQuery(
    undefined,
    {
      retry: 3,
      retryDelay: 2000,
    }
  )

  useEffect(() => {
    if (isError && error.message.includes("Can't reach database")) {
      const timer = setTimeout(() => {
        setRetryCount((count) => count + 1)
        void refetch()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isError, error, refetch])

  if (isLoading) {
    return <LoadingState message="Loading projects..." />
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error Loading Projects</CardTitle>
          <CardDescription>
            {error.message.includes("Can't reach database")
              ? "Database is warming up... Please wait"
              : "An error occurred while loading projects"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button
            onClick={() => void refetch()}
            variant="outline"
            disabled={retryCount < 3}
          >
            <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
            {retryCount < 3 ? "Retrying..." : "Retry"}
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!projects?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Projects</CardTitle>
          <CardDescription>You haven&apos;t created any projects yet.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {projects.map((project) => (
        <Card key={project.id}>
          <CardHeader>
            <CardTitle className="text-[#FFFFFF] text-xl">{project.name}</CardTitle>
            <CardDescription className="text-[#E0E0E0]">{project.githubUrl}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
