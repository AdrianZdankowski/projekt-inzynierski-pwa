
# This stage is used when running from VS in fast mode (default for debug configuration)
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
USER root
RUN apt-get update && apt-get install -y ffmpeg && apt-get clean && rm -rf /var/lib/apt/lists/*
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

# This stage is used to build the service project
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy solution file
COPY ["backend.sln", "./"]

# Copy all project files and source files needed for restore
COPY ["backend.Test/", "backend.Test/"]
COPY ["PwaApp.Domain/", "PwaApp.Domain/"]
COPY ["PwaApp.Application/", "PwaApp.Application/"]
COPY ["PwaApp.Infrastructure/", "PwaApp.Infrastructure/"]
COPY ["PwaApp.Web/", "PwaApp.Web/"]

# Restore dependencies - restore only the web project, dependencies will be restored automatically
RUN dotnet restore "backend.sln"

# Build the project
WORKDIR "/src/PwaApp.Web"
RUN dotnet build "PwaApp.Web.csproj" -c $BUILD_CONFIGURATION -o /app/build

# This stage is used to publish the service project to copy to the final stage
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "PwaApp.Web.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# This stage is used in production or when running from VS in regular mode (default when debug configuration is not used)
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "PwaApp.Web.dll"]