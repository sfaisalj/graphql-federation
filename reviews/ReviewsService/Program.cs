using ReviewsService.Services;
using ReviewsService.Types;

var builder = WebApplication.CreateBuilder(args);

// Configure to run on port 4002
builder.WebHost.UseUrls("http://localhost:4002", "http://0.0.0.0:4002");

builder.Services
    .AddSingleton<ReviewService>()
    .AddGraphQLServer()
    .AddQueryType<Query>();

var app = builder.Build();

app.MapGraphQL();

app.Run();
