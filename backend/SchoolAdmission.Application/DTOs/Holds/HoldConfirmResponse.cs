namespace SchoolAdmission.Application.DTOs.Holds;

public sealed record HoldConfirmResponse(
    Guid HoldId,
    string Status

);