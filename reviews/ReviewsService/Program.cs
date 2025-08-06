using ReviewsService.Services;
using ReviewsService.Types;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddSingleton<ReviewService>()
    .AddGraphQLServer()
    .AddQueryType<Query>();

var app = builder.Build();

app.MapGraphQL();

app.Run();
