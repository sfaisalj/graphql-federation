namespace ReviewsService.Types;

public class Review
{
    public string Id { get; set; } = default!;
    public string Body { get; set; } = default!;
    public string AccountId { get; set; } = default!;
}