export const dynamic = "force-dynamic"

import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ReviewForm } from "@/components/forms/review-form"
import { Star } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { clientAvatarUrl, reviewImageUrl } from "@/lib/image-utils"

export const metadata: Metadata = {
  title: "Reviews",
  description: "Read what our clients say about their tattoo experience.",
}

// studioId is not optional here: without it this query returns every studio's
// reviews on every studio's page. It was missing before, and only went unnoticed
// because no reviews existed yet.
async function getReviewsData(studioId: string) {
  const reviews = await prisma.review.findMany({
    where: { studioId, isArchived: false },
    include: {
      client: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
      gallery: true,
    },
    orderBy: { createdAt: "desc" },
  })

  return reviews
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-5 w-5 ${
            star <= rating
              ? "fill-yellow-400 text-yellow-400"
              : "text-muted-foreground/30"
          }`}
        />
      ))}
    </div>
  )
}

export default async function ReviewsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  const studio = await prisma.studio.findUnique({
    where: { slug },
    select: { id: true },
  })
  if (!studio) {
    notFound()
  }

  const reviews = await getReviewsData(studio.id)

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rate, 0) / reviews.length
      : 0

  return (
    <div className="py-12 md:py-16">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Client Reviews</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
            Read what our clients have to say about their tattoo experience.
          </p>
          {reviews.length > 0 && (
            <div className="flex items-center justify-center gap-2">
              <StarRating rating={Math.round(averageRating)} />
              <span className="text-lg font-semibold">
                {averageRating.toFixed(1)}
              </span>
              <span className="text-muted-foreground">
                ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
              </span>
            </div>
          )}
        </div>

        {/* Submit Review Form — open to the studio's customers, who have no login.
            The email they give is checked against the studio's client contacts. */}
        <Card className="max-w-2xl mx-auto mb-12">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Share Your Experience</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Reviews can be left by the studio&apos;s clients.
            </p>
            <ReviewForm studioSlug={slug} />
          </CardContent>
        </Card>

        {/* Reviews List */}
        {reviews.length > 0 ? (
          <div className="max-w-3xl mx-auto space-y-6">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage
                        src={review.client.avatar ? clientAvatarUrl(review.client.id, review.client.avatar) : undefined}
                        alt={review.client.fullName}
                      />
                      <AvatarFallback>
                        {review.client.fullName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">
                          {review.client.fullName}
                        </h3>
                        <span className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(review.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <StarRating rating={review.rate} />
                      <p className="mt-3 text-muted-foreground whitespace-pre-wrap">
                        {review.content}
                      </p>
                      {review.gallery.length > 0 && (
                        <div className="flex gap-2 mt-4 flex-wrap">
                          {review.gallery.map((img) => (
                            <div
                              key={img.id}
                              className="w-20 h-20 rounded-md overflow-hidden bg-muted"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={reviewImageUrl(review.id, img.fileName)}
                                alt="Review image"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No reviews yet. Be the first to share your experience!
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="text-center mt-16">
          <h2 className="text-2xl font-semibold mb-4">
            Ready for your own experience?
          </h2>
          <Button size="lg" asChild>
            <Link href="/#booking">Book Consultation</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
