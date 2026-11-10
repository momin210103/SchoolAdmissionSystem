
using System.Net;
using System.Net.Http.Json;
using SchoolAdmission.Application.DTOs.Classes;
using SchoolAdmission.Tests.TestInfrastructure;

namespace SchoolAdmission.Tests.Integration;

public sealed class HoldsApiTests
    : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly CustomWebApplicationFactory _factory;

    public HoldsApiTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _factory.EnsureDatabaseMigrated();
        _client = factory.CreateClient();
    }

    private async Task<Guid> CreateClassAsync(int seats)
    {
        var request = new CreateClassRequest(
            $"Hold Test Class {Guid.NewGuid():N}",
            seats
        );

        var response = await _client.PostAsJsonAsync(
            "/classes", request);

        response.EnsureSuccessStatusCode();

        var result = await response.Content
            .ReadFromJsonAsync<ClassResponse>();

        return result!.Id;
    }

    private void SetStudent(string studentId)
    {
        _client.DefaultRequestHeaders.Remove("X-Student-Id");
        _client.DefaultRequestHeaders.Add("X-Student-Id", studentId);
    }

    [Fact]
    public async Task CreateHold_WithAvailableSeat_Returns201Created()
    {
        // Arrange
        var classId = await CreateClassAsync(2);
        SetStudent("12345678912345678");

        // Act
        var response = await _client.PostAsync(
            $"/classes/{classId}/holds", null);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task CreateHold_WhenStudentAlreadyHasActiveHold_ReturnsConflict()
    {
        // Arrange
        var classId = await CreateClassAsync(2);
        SetStudent("12345678912345678");

        var firstResponse = await _client.PostAsync(
            $"/classes/{classId}/holds", null);

        Assert.Equal(HttpStatusCode.Created, firstResponse.StatusCode);

        // Act
        var secondResponse = await _client.PostAsync(
            $"/classes/{classId}/holds", null);

        // Assert
        Assert.Equal(HttpStatusCode.Conflict, secondResponse.StatusCode);
    }

    [Fact]
    public async Task CreateHold_WhenNoSeatsAvailable_ReturnsConflict()
    {
        // Arrange
        var classId = await CreateClassAsync(1);

        SetStudent("12345678912345678");

        var firstResponse = await _client.PostAsync(
            $"/classes/{classId}/holds", null);

        Assert.Equal(HttpStatusCode.Created, firstResponse.StatusCode);

        SetStudent("98765432198765432");

        // Act
        var secondResponse = await _client.PostAsync(
            $"/classes/{classId}/holds", null);

        // Assert
        Assert.Equal(HttpStatusCode.Conflict, secondResponse.StatusCode);
    }

    [Fact]
    public async Task ConfirmHold_WhenCalledByDifferentStudent_ReturnsForbidden()
    {
        // Arrange
        var classId = await CreateClassAsync(2);

        SetStudent("12345678912345678");

        var createResponse = await _client.PostAsync(
            $"/classes/{classId}/holds", null);

        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);

        var hold = await createResponse.Content
            .ReadFromJsonAsync<HoldResponse>();

        Assert.NotNull(hold);

        SetStudent("98765432198765432");

        // Act
        var response = await _client.PostAsync(
            $"/holds/{hold.HoldId}/confirm", null);

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task ConfirmHold_WithValidOwner_ReturnsConfirmed()
    {
        // Arrange
        var classId = await CreateClassAsync(2);
        SetStudent("12345678912345678");

        var createResponse = await _client.PostAsync(
            $"/classes/{classId}/holds", null);

        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);

        var hold = await createResponse.Content
            .ReadFromJsonAsync<HoldResponse>();

        Assert.NotNull(hold);

        // Act
        var response = await _client.PostAsync(
            $"/holds/{hold.HoldId}/confirm", null);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    private sealed record HoldResponse(
        Guid HoldId,
        Guid ClassId,
        string StudentId,
        string Status,
        DateTime ExpiresAt
    );
}
