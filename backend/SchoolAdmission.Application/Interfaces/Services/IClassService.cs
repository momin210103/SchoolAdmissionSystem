using SchoolAdmission.Application.DTOs.Classes;

namespace SchoolAdmission.Application.Interfaces.Services;

public interface IClassService
{
    Task<ClassResponse> CreateAsync(
        CreateClassRequest request,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<ClassResponse>> GetAllAsync(
        CancellationToken cancellationToken = default);

    Task<ClassResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default);
}