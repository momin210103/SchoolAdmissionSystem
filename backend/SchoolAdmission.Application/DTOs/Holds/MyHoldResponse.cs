namespace SchoolAdmission.Application.DTOs.Holds;

public sealed record MyHoldResponse(
    Guid HoldId,
    Guid ClassId,
    string ClassName,
    string Status,
    DateTime ExpiresAt
);