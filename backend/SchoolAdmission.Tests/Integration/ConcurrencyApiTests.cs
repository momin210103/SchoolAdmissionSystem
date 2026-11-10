
using System.Net;
using System.Net.Http.Json;
using SchoolAdmission.Application.DTOs.Classes;
using SchoolAdmission.Tests.TestInfrastructure;

namespace SchoolAdmission.Tests.Integration;

public sealed class ConcurrencyApiTests
    : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public ConcurrencyApiTests(
        CustomWebApplicationFactory factory)
    {
        factory.EnsureDatabaseMigrated();
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task CreateHold_ConcurrentRequests_ShouldNotOversellSeats()
    {
        // Arrange
        const int totalSeats = 5;
        const int totalStudents = 20;

        var classId = await CreateClassAsync(totalSeats);

        // Act: 20 students request seats simultaneously.
        var tasks = Enumerable
            .Range(1, totalStudents)
            .Select(studentNumber =>
                CreateHoldAsync(classId, studentNumber));

        var results = await Task.WhenAll(tasks);

        // Assert: Exactly 5 students should get a seat.
        var successfulRequests = results.Count(
            status => status == HttpStatusCode.Created);

        var rejectedRequests = results.Count(
            status => status == HttpStatusCode.Conflict);

        Assert.Equal(totalSeats, successfulRequests);

        Assert.Equal(
            totalStudents - totalSeats,
            rejectedRequests);

        // Verify final class seat statistics.
        var classResponse = await _client.GetAsync(
            $"/classes/{classId}");

        classResponse.EnsureSuccessStatusCode();

        var classDetails = await classResponse.Content
            .ReadFromJsonAsync<ClassResponse>();

        Assert.NotNull(classDetails);

        Assert.Equal(totalSeats, classDetails.TotalSeats);
        Assert.Equal(totalSeats, classDetails.HeldSeats);
        Assert.Equal(0, classDetails.ConfirmedSeats);
        Assert.Equal(0, classDetails.AvailableSeats);
    }

    private async Task<Guid> CreateClassAsync(int totalSeats)
    {
        var request = new CreateClassRequest(
            Name: $"Concurrency Test {Guid.NewGuid():N}",
            TotalSeats: totalSeats);

        var response = await _client.PostAsJsonAsync(
            "/classes",
            request);

        response.EnsureSuccessStatusCode();

        var result = await response.Content
            .ReadFromJsonAsync<ClassResponse>();

        Assert.NotNull(result);

        return result.Id;
    }

    private async Task<HttpStatusCode> CreateHoldAsync(
        Guid classId,
        int studentNumber)
    {
        // Every request gets its own student identity.
        var studentId = $"2{studentNumber:D16}";

        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            $"/classes/{classId}/holds");

        request.Headers.Add("X-Student-Id", studentId);

        using var response = await _client.SendAsync(request);

        return response.StatusCode;
    }
}
