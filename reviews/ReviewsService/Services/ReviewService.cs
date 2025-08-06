using ReviewsService.Types;

namespace ReviewsService.Services;

public class ReviewService
{
    private readonly List<Review> _reviews = new()
    {
        new Review { Id = "1", Body = "Great product! Highly recommended.", AccountId = "1" },
        new Review { Id = "2", Body = "Good quality but could be better.", AccountId = "1" },
        new Review { Id = "3", Body = "Amazing service and fast delivery.", AccountId = "2" },
        new Review { Id = "4", Body = "Not satisfied with the purchase.", AccountId = "2" },
        new Review { Id = "5", Body = "Excellent value for money!", AccountId = "3" }
    };

    public Review? GetReviewById(string id)
        => _reviews.FirstOrDefault(r => r.Id == id);

    public IEnumerable<Review> GetReviewsByAccountId(string accountId)
        => _reviews.Where(r => r.AccountId == accountId);

    public IEnumerable<Review> GetAllReviews()
        => _reviews;
}