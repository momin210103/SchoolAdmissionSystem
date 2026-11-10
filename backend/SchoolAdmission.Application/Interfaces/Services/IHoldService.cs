using SchoolAdmission.Application.DTOs.Holds;

namespace SchoolAdmission.Application.Interfaces.Services;

public interface IHoldService
{
    Task<CreateHoldResponse> CreateAsync(
        Guid classId,
        string studentId,
        CancellationToken cancellationToken = default);
}