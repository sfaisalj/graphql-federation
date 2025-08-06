var builder = WebApplication.CreateBuilder(args);

var environment = builder.Environment;
var fusionFile = environment.IsDevelopment() && Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") != "Docker" 
    ? "./gateway.fgp" 
    : "./gateway.docker.fgp";

builder.Services
    .AddHttpClient()
    .AddFusionGatewayServer()
    .ConfigureFromFile(fusionFile);

var app = builder.Build();

app.MapGraphQL();

app.Run();
