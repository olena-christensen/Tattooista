export const dynamic = "force-dynamic"

import { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  CalendarCheck,
  Users,
  Image as ImageIcon,
  Star,
  ArrowRight,
  ExternalLink,
} from "lucide-react"

export const metadata: Metadata = {
  title: "Admin Dashboard",
}

async function getDashboardStats(studioId: string) {
  const [
    pendingBookings,
    totalClients,
    totalGalleryItems,
    totalReviews,
    recentBookings,
  ] = await Promise.all([
    prisma.booking.count({
      where: { studioId, status: "PENDING", isArchived: false },
    }),
    prisma.client.count({
      where: { studioId, isArchived: false },
    }),
    prisma.galleryItem.count({
      where: { studioId, isArchived: false },
    }),
    prisma.review.count({
      where: { studioId, isArchived: false },
    }),
    prisma.booking.findMany({
      where: { studioId, isArchived: false },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ])

  return {
    pendingBookings,
    totalClients,
    totalGalleryItems,
    totalReviews,
    recentBookings,
  }
}

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const studio = await prisma.studio.findUnique({
    where: { slug },
    select: { id: true, name: true },
  })
  if (!studio) notFound()
  const stats = await getDashboardStats(studio.id)

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome to your admin dashboard.
          </p>
        </div>
        <Link
          href={`/${slug}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Go to {studio.name}
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Bookings
            </CardTitle>
            <CalendarCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingBookings}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              Active clients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gallery Items</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGalleryItems}</div>
            <p className="text-xs text-muted-foreground">
              In portfolio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviews</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReviews}</div>
            <p className="text-xs text-muted-foreground">
              Client reviews
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bookings */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Bookings</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/${slug}/admin/bookings`}>
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {stats.recentBookings.length > 0 ? (
            <div className="space-y-4">
              {stats.recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{booking.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.email || booking.phone || booking.instagram || "No contact"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-medium ${
                        booking.status === "PENDING"
                          ? "text-yellow-600"
                          : booking.status === "CONTACTED"
                          ? "text-blue-600"
                          : booking.status === "COMPLETED"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {booking.status}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No bookings yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Manage consultation requests and convert them to clients.
            </p>
            <Button asChild>
              <Link href={`/${slug}/admin/bookings`}>View Bookings</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Gallery</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Upload and manage your portfolio images.
            </p>
            <Button asChild>
              <Link href={`/${slug}/admin/gallery`}>Manage Gallery</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              View and manage your client records.
            </p>
            <Button asChild>
              <Link href={`/${slug}/admin/clients`}>View Clients</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
