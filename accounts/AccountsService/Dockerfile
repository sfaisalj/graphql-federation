FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 4001

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["AccountsService.csproj", "."]
RUN dotnet restore "AccountsService.csproj"
COPY . .
WORKDIR "/src"
RUN dotnet build "AccountsService.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "AccountsService.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "AccountsService.dll"]