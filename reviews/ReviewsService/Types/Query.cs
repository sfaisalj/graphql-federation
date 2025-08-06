using ReviewsService.Services;

namespace ReviewsService.Types;

public class Query
{
    public Review? GetReviewById(string id, [Service] ReviewService reviewService)
        => reviewService.GetReviewById(id);

    public IEnumerable<Review> GetReviewsByAccountId(string accountId, [Service] ReviewService reviewService)
        => reviewService.GetReviewsByAccountId(accountId);

    public IEnumerable<Review> GetReviews([Service] ReviewService reviewService)
        => reviewService.GetAllReviews();
}