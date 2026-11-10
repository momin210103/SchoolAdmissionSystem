namespace SchoolAdmission.Application.DTOs.Holds;

public sealed record CreateHoldResponse(
    Guid HoldId,
    Guid ClassId,
    string StudentId,
    string Status,
    DateTime ExpiresAt
);