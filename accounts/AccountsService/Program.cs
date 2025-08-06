using AccountsService.Services;
using AccountsService.Types;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddSingleton<AccountService>()
    .AddGraphQLServer()
    .AddQueryType<Query>();

var app = builder.Build();

app.MapGraphQL();

app.Run();
