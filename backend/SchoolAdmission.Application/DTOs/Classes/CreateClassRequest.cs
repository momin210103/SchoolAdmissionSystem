namespace SchoolAdmission.Application.DTOs.Classes;

public sealed record CreateClassRequest(
    string Name,
    int TotalSeats
);