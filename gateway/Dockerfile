FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5001
# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["GraphQLFusionGateway.csproj", "."]
RUN dotnet restore "GraphQLFusionGateway.csproj"
COPY . .
WORKDIR "/src"
RUN dotnet build "GraphQLFusionGateway.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "GraphQLFusionGateway.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
COPY *.fgp ./
COPY *.sh ./
RUN chmod +x *.sh

# Create an entrypoint script that generates fusion config and starts the app
RUN echo '#!/bin/bash\n\
if [ "$ASPNETCORE_ENVIRONMENT" = "Docker" ]; then\n\
  echo "Generating fusion configuration..."\n\
  ./generate-fusion-config-docker.sh\n\
fi\n\
echo "Starting gateway..."\n\
exec dotnet GraphQLFusionGateway.dll\n\
' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]