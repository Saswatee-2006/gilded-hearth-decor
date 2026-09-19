import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
// Removed supabase import
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function CustomerReviews({ productSlug }: { productSlug: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");

  const reviewsQuery = useQuery({
    queryKey: ["reviews", productSlug],
    queryFn: async () => {
      // Mock local storage fetch
      const saved = localStorage.getItem("mock_reviews_" + productSlug);
      return saved ? JSON.parse(saved) : [];
    },
  });

  const submit = useMutation({
    mutationFn: async () => {
      // Mock local storage save
      const existing = localStorage.getItem("mock_reviews_" + productSlug);
      const reviews = existing ? JSON.parse(existing) : [];
      reviews.unshift({
        id: "rev_" + Math.random().toString(36).substr(2, 9),
        user_id: user!.id,
        product_slug: productSlug,
        author_name: user!.email?.split("@")[0] ?? "Customer",
        rating,
        body: body.trim().slice(0, 1000),
        created_at: new Date().toISOString()
      });
      localStorage.setItem("mock_reviews_" + productSlug, JSON.stringify(reviews));
    },
    onSuccess: () => {
      setBody("");
      setRating(5);
      toast.success("Thanks! Your review is in for moderation.");
      queryClient.invalidateQueries({ queryKey: ["reviews", productSlug] });
    },
    onError: () => toast.error("Could not submit your review"),
  });

  return (
    <div>
      {(reviewsQuery.data?.length ?? 0) > 0 && (
        <ul className="mb-8 space-y-6">
          {reviewsQuery.data?.map((r: any) => (
            <li key={r.id} className="border-b pb-5">
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={cn(
                      "h-3.5 w-3.5",
                      s <= r.rating ? "fill-brass text-brass" : "text-border",
                    )}
                  />
                ))}
                <span className="text-sm">{r.author_name}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{r.body}</p>
            </li>
          ))}
        </ul>
      )}

      {user ? (
        <form
          className="rounded-md border p-5"
          onSubmit={(e) => {
            e.preventDefault();
            if (body.trim().length < 5) {
              toast.error("Please write a little more");
              return;
            }
            submit.mutate();
          }}
        >
          <p className="eyebrow">Write a review</p>
          <div className="mt-3 flex gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} type="button" aria-label={`${s} star`} onClick={() => setRating(s)}>
                <Star
                  className={cn("h-5 w-5", s <= rating ? "fill-brass text-brass" : "text-border")}
                />
              </button>
            ))}
          </div>
          <Textarea
            className="mt-3"
            value={body}
            maxLength={1000}
            onChange={(e) => setBody(e.target.value)}
            placeholder="How does it look in your space?"
            required
          />
          <div className="mt-3 flex items-center gap-3">
            <Button type="submit" disabled={submit.isPending}>
              Submit review
            </Button>
            <span className="text-xs text-muted-foreground">
              Reviews appear once our team approves them
            </span>
          </div>
        </form>
      ) : (
        <div className="rounded-md border p-5 text-sm text-muted-foreground">
          <Link to="/auth" className="underline">
            Sign in
          </Link>{" "}
          to share your review of this piece.
        </div>
      )}
    </div>
  );
}
