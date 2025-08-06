using System.Text;
using System.Text.Json;
using FluentAssertions;

namespace GraphQLFusion.IntegrationTests;

public class GraphQLGatewayTests
{
    private readonly HttpClient _client;
    private readonly JsonSerializerOptions _jsonOptions;

    public GraphQLGatewayTests()
    {
        _client = new HttpClient { BaseAddress = new Uri("http://localhost:5001") };
        
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
    }

    [Fact]
    public async Task GetAccounts_ShouldReturnAllAccounts()
    {
        // Arrange
        var query = new
        {
            query = "{ accounts { id name email } }"
        };

        var json = JsonSerializer.Serialize(query, _jsonOptions);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync("/graphql", content);

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<GraphQLResponse<AccountsData>>(responseContent, _jsonOptions);

        result.Should().NotBeNull();
        result!.Data.Should().NotBeNull();
        result.Data!.Accounts.Should().HaveCount(3);
        result.Data.Accounts.Should().Contain(a => a.Name == "John Doe");
        result.Data.Accounts.Should().Contain(a => a.Name == "Jane Smith");
        result.Data.Accounts.Should().Contain(a => a.Name == "Bob Johnson");
    }

    [Fact]
    public async Task GetAccountById_ShouldReturnSpecificAccount()
    {
        // Arrange
        var query = new
        {
            query = "{ accountById(id: \"1\") { id name email } }"
        };

        var json = JsonSerializer.Serialize(query, _jsonOptions);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync("/graphql", content);

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<GraphQLResponse<AccountByIdData>>(responseContent, _jsonOptions);

        result.Should().NotBeNull();
        result!.Data.Should().NotBeNull();
        result.Data!.AccountById.Should().NotBeNull();
        result.Data.AccountById!.Id.Should().Be("1");
        result.Data.AccountById.Name.Should().Be("John Doe");
        result.Data.AccountById.Email.Should().Be("john@example.com");
    }

    [Fact]
    public async Task GetReviews_ShouldReturnAllReviews()
    {
        // Arrange
        var query = new
        {
            query = "{ reviews { id body accountId } }"
        };

        var json = JsonSerializer.Serialize(query, _jsonOptions);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync("/graphql", content);

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<GraphQLResponse<ReviewsData>>(responseContent, _jsonOptions);

        result.Should().NotBeNull();
        result!.Data.Should().NotBeNull();
        result.Data!.Reviews.Should().HaveCount(5);
        result.Data.Reviews.Should().Contain(r => r.Body.Contains("Great product"));
        result.Data.Reviews.Should().Contain(r => r.AccountId == "1");
    }

    [Fact]
    public async Task GetReviewsByAccountId_ShouldReturnAccountSpecificReviews()
    {
        // Arrange
        var query = new
        {
            query = "{ reviewsByAccountId(accountId: \"1\") { id body accountId } }"
        };

        var json = JsonSerializer.Serialize(query, _jsonOptions);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync("/graphql", content);

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<GraphQLResponse<ReviewsByAccountData>>(responseContent, _jsonOptions);

        result.Should().NotBeNull();
        result!.Data.Should().NotBeNull();
        result.Data!.ReviewsByAccountId.Should().HaveCount(2);
        result.Data.ReviewsByAccountId.Should().OnlyContain(r => r.AccountId == "1");
    }

    [Fact]
    public async Task GetMultipleQueries_ShouldReturnBothAccountsAndReviews()
    {
        // Arrange
        var query = new
        {
            query = @"{ 
                accounts { id name email } 
                reviews { id body accountId } 
            }"
        };

        var json = JsonSerializer.Serialize(query, _jsonOptions);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync("/graphql", content);

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<GraphQLResponse<CombinedData>>(responseContent, _jsonOptions);

        result.Should().NotBeNull();
        result!.Data.Should().NotBeNull();
        result.Data!.Accounts.Should().HaveCount(3);
        result.Data.Reviews.Should().HaveCount(5);
    }

    [Fact]
    public async Task InvalidQuery_ShouldReturnErrors()
    {
        // Arrange
        var query = new
        {
            query = "{ invalidField }"
        };

        var json = JsonSerializer.Serialize(query, _jsonOptions);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _client.PostAsync("/graphql", content);

        // Assert
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<GraphQLResponse<object>>(responseContent, _jsonOptions);

        result.Should().NotBeNull();
        result!.Errors.Should().NotBeNull();
        result.Errors.Should().NotBeEmpty();
    }

    public void Dispose()
    {
        _client?.Dispose();
    }
}

// Response DTOs
public class GraphQLResponse<T>
{
    public T? Data { get; set; }
    public GraphQLError[]? Errors { get; set; }
}

public class GraphQLError
{
    public string Message { get; set; } = string.Empty;
}

public class Account
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}

public class Review
{
    public string Id { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string AccountId { get; set; } = string.Empty;
}

public class AccountsData
{
    public List<Account> Accounts { get; set; } = new();
}

public class AccountByIdData
{
    public Account? AccountById { get; set; }
}

public class ReviewsData
{
    public List<Review> Reviews { get; set; } = new();
}

public class ReviewsByAccountData
{
    public List<Review> ReviewsByAccountId { get; set; } = new();
}

public class CombinedData
{
    public List<Account> Accounts { get; set; } = new();
    public List<Review> Reviews { get; set; } = new();
}