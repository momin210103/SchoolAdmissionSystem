# Stage 1: Build & Publish
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files for layer-cached dependency restore
COPY backend/SchoolAdmission.Domain/SchoolAdmission.Domain.csproj backend/SchoolAdmission.Domain/
COPY backend/SchoolAdmission.Application/SchoolAdmission.Application.csproj backend/SchoolAdmission.Application/
COPY backend/SchoolAdmission.Infrastructure/SchoolAdmission.Infrastructure.csproj backend/SchoolAdmission.Infrastructure/
COPY backend/SchoolAdmission.API/SchoolAdmission.API.csproj backend/SchoolAdmission.API/

# Restore dependencies
RUN dotnet restore backend/SchoolAdmission.API/SchoolAdmission.API.csproj

# Copy source code for the API and referenced projects
COPY backend/SchoolAdmission.Domain/ backend/SchoolAdmission.Domain/
COPY backend/SchoolAdmission.Application/ backend/SchoolAdmission.Application/
COPY backend/SchoolAdmission.Infrastructure/ backend/SchoolAdmission.Infrastructure/
COPY backend/SchoolAdmission.API/ backend/SchoolAdmission.API/

# Publish the API in Release configuration
WORKDIR /src/backend/SchoolAdmission.API
RUN dotnet publish SchoolAdmission.API.csproj -c Release -o /app/publish --no-restore

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

ENV ASPNETCORE_HTTP_PORTS=8080
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "SchoolAdmission.API.dll"]
