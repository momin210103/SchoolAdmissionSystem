namespace SchoolAdmission.Application.DTOs.Holds;

public sealed record HoldResponse(
    Guid HoldId,
    Guid ClassId,
    string Status,
    DateTime ExpiresAt
);