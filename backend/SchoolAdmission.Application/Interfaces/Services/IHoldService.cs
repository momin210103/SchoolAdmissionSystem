using SchoolAdmission.Application.DTOs.Holds;

namespace SchoolAdmission.Application.Interfaces.Services;

public interface IHoldService
{
    Task<CreateHoldResponse> CreateAsync(
        Guid classId,
        string studentId,
        CancellationToken cancellationToken = default);
    Task<HoldResponse> GetByIdAsync(Guid holdId,CancellationToken cancellationToken = default);
    Task<HoldConfirmResponse> ConfirmAsync(
        Guid holdId,
        string studentId,
        CancellationToken cancellationToken
    );
}