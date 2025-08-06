using AccountsService.Services;
using AccountsService.Types;

var builder = WebApplication.CreateBuilder(args);

// Configure to run on port 4001
builder.WebHost.UseUrls("http://localhost:4001", "http://0.0.0.0:4001");

builder.Services
    .AddSingleton<AccountService>()
    .AddGraphQLServer()
    .AddQueryType<Query>();

var app = builder.Build();

app.MapGraphQL();

app.Run();
