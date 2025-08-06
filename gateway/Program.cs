var builder = WebApplication.CreateBuilder(args);

// Configure to run on port 5001
builder.WebHost.UseUrls("http://localhost:5001", "http://0.0.0.0:5001");

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
