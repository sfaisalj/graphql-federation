using System.Text;
using System.Text.Json;
using FluentAssertions;

namespace GraphQLFusion.IntegrationTests;

public class DirectServiceTests
{
    private readonly HttpClient _accountsClient;
    private readonly HttpClient _reviewsClient;
    private readonly JsonSerializerOptions _jsonOptions;

    public DirectServiceTests()
    {
        _accountsClient = new HttpClient { BaseAddress = new Uri("http://localhost:4001") };
        _reviewsClient = new HttpClient { BaseAddress = new Uri("http://localhost:4002") };
        
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
    }

    [Fact]
    public async Task AccountsService_GetAllAccounts_ShouldReturnThreeAccounts()
    {
        // Arrange
        var query = new { query = "{ accounts { id name email } }" };
        var json = JsonSerializer.Serialize(query, _jsonOptions);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _accountsClient.PostAsync("/graphql", content);

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<GraphQLResponse<AccountsData>>(responseContent, _jsonOptions);

        result.Should().NotBeNull();
        result!.Data.Should().NotBeNull();
        result.Data!.Accounts.Should().HaveCount(3);
        result.Data.Accounts.Should().Contain(a => a.Name == "John Doe" && a.Email == "john@example.com");
        result.Data.Accounts.Should().Contain(a => a.Name == "Jane Smith" && a.Email == "jane@example.com");
        result.Data.Accounts.Should().Contain(a => a.Name == "Bob Johnson" && a.Email == "bob@example.com");
    }

    [Fact]
    public async Task AccountsService_GetAccountById_ShouldReturnSpecificAccount()
    {
        // Arrange
        var query = new { query = "{ accountById(id: \"1\") { id name email } }" };
        var json = JsonSerializer.Serialize(query, _jsonOptions);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _accountsClient.PostAsync("/graphql", content);

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
    public async Task ReviewsService_GetAllReviews_ShouldReturnFiveReviews()
    {
        // Arrange
        var query = new { query = "{ reviews { id body accountId } }" };
        var json = JsonSerializer.Serialize(query, _jsonOptions);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _reviewsClient.PostAsync("/graphql", content);

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<GraphQLResponse<ReviewsData>>(responseContent, _jsonOptions);

        result.Should().NotBeNull();
        result!.Data.Should().NotBeNull();
        result.Data!.Reviews.Should().HaveCount(5);
        result.Data.Reviews.Should().Contain(r => r.Body.Contains("Great product"));
        result.Data.Reviews.Should().Contain(r => r.AccountId == "1");
        result.Data.Reviews.Should().Contain(r => r.AccountId == "2");
        result.Data.Reviews.Should().Contain(r => r.AccountId == "3");
    }

    [Fact]
    public async Task ReviewsService_GetReviewsByAccountId_ShouldReturnAccountSpecificReviews()
    {
        // Arrange
        var query = new { query = "{ reviewsByAccountId(accountId: \"1\") { id body accountId } }" };
        var json = JsonSerializer.Serialize(query, _jsonOptions);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _reviewsClient.PostAsync("/graphql", content);

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
    public async Task AccountsService_GetNonExistentAccount_ShouldReturnNull()
    {
        // Arrange
        var query = new { query = "{ accountById(id: \"999\") { id name email } }" };
        var json = JsonSerializer.Serialize(query, _jsonOptions);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _accountsClient.PostAsync("/graphql", content);

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<GraphQLResponse<AccountByIdData>>(responseContent, _jsonOptions);

        result.Should().NotBeNull();
        result!.Data.Should().NotBeNull();
        result.Data!.AccountById.Should().BeNull();
    }

    [Fact]
    public async Task ReviewsService_GetReviewsForNonExistentAccount_ShouldReturnEmptyArray()
    {
        // Arrange
        var query = new { query = "{ reviewsByAccountId(accountId: \"999\") { id body accountId } }" };
        var json = JsonSerializer.Serialize(query, _jsonOptions);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Act
        var response = await _reviewsClient.PostAsync("/graphql", content);

        // Assert
        response.IsSuccessStatusCode.Should().BeTrue();
        
        var responseContent = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<GraphQLResponse<ReviewsByAccountData>>(responseContent, _jsonOptions);

        result.Should().NotBeNull();
        result!.Data.Should().NotBeNull();
        result.Data!.ReviewsByAccountId.Should().BeEmpty();
    }

    public void Dispose()
    {
        _accountsClient?.Dispose();
        _reviewsClient?.Dispose();
    }
}