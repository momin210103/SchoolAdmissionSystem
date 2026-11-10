using System.Net;
using System.Net.Http.Json;
using SchoolAdmission.Application.DTOs.Classes;
using SchoolAdmission.Tests.TestInfrastructure;

namespace SchoolAdmission.Tests.Integration;

public sealed class ClassesApiTests
    : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public ClassesApiTests(CustomWebApplicationFactory factory)
    {
        factory.EnsureDatabaseMigrated();

        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CreateClass_WithValidRequest_Returns201Created()
    {
        // Arrange
        var request = new CreateClassRequest(
            Name: $"Integration Test Class {Guid.NewGuid():N}",
            TotalSeats: 120
        );

        // Act
        var response = await _client.PostAsJsonAsync(
            "/classes",
            request
        );

        // Assert
        Assert.Equal(
            HttpStatusCode.Created,
            response.StatusCode
        );

        var result = await response.Content
            .ReadFromJsonAsync<ClassResponse>();

        Assert.NotNull(result);
        Assert.NotEqual(Guid.Empty, result.Id);
        Assert.Equal(request.Name, result.Name);
        Assert.Equal(120, result.TotalSeats);
        Assert.Equal(0, result.HeldSeats);
        Assert.Equal(0, result.ConfirmedSeats);
        Assert.Equal(120, result.AvailableSeats);

        Assert.NotNull(response.Headers.Location);
    }

    [Fact]
    public async Task GetAllClasses_WhenClassesExist_Returns200Ok()
    {
        // Arrange
        var className = $"Integration Test {Guid.NewGuid():N}";

        var createRequest = new CreateClassRequest(
            Name: className,
            TotalSeats: 80
        );

        var createResponse = await _client.PostAsJsonAsync(
            "/classes",
            createRequest
        );

        createResponse.EnsureSuccessStatusCode();

        // Act
        var response = await _client.GetAsync("/classes");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var classes = await response.Content
            .ReadFromJsonAsync<List<ClassResponse>>();

        Assert.NotNull(classes);

        var createdClass = Assert.Single(
            classes.Where(c => c.Name == className)
        );

        Assert.Equal(80, createdClass.TotalSeats);
        Assert.Equal(80, createdClass.AvailableSeats);
    }

    [Fact]
    public async Task CreateClass_WithZeroSeats_Returns400BadRequest()
    {
        // Arrange
        var request = new CreateClassRequest(
            Name: $"Invalid Class {Guid.NewGuid():N}",
            TotalSeats: 0
        );

        // Act
        var response = await _client.PostAsJsonAsync(
            "/classes",
            request
        );

        // Assert
        Assert.Equal(
            HttpStatusCode.BadRequest,
            response.StatusCode
        );
    }
    [Fact]
    public async Task CreateClass_WithEmptyName_Returns400BadRequest()
    {
        // Arrange
        var request = new CreateClassRequest(
            Name: string.Empty,
            TotalSeats: 50
        );

        // Act
        var response = await _client.PostAsJsonAsync(
            "/classes",
            request
        );

        // Assert
        Assert.Equal(
            HttpStatusCode.BadRequest,
            response.StatusCode
        );
    }
    [Fact]
    public async Task GetClassById_WhenClassExists_Returns200Ok()
    {
        // Arrange
        var request = new CreateClassRequest(
            Name: $"Find Class {Guid.NewGuid():N}",
            TotalSeats: 50
        );

        var createResponse = await _client.PostAsJsonAsync(
            "/classes",
            request
        );

        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);

        var createdClass = await createResponse.Content
            .ReadFromJsonAsync<ClassResponse>();

        Assert.NotNull(createdClass);

        // Act
        var response = await _client.GetAsync(
            $"/classes/{createdClass.Id}"
        );

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var result = await response.Content
            .ReadFromJsonAsync<ClassResponse>();

        Assert.NotNull(result);
        Assert.Equal(createdClass.Id, result.Id);
        Assert.Equal(request.Name, result.Name);
    }

    
}