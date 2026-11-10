using Microsoft.EntityFrameworkCore;
using SchoolAdmission.Application.DTOs.Classes;
using SchoolAdmission.Application.Interfaces.Services;
using SchoolAdmission.Domain;
using SchoolAdmission.Domain.Entities;
using SchoolAdmission.Infrastructure.Persistence;

namespace SchoolAdmission.Infrastructure.Services;

public sealed class ClassService : IClassService
{
    private readonly ApplicationDbContext _context;

    public ClassService(ApplicationDbContext context)
    {
        _context = context;
    }
    public async Task<ClassResponse> CreateAsync(
        CreateClassRequest request,
        CancellationToken cancellationToken = default)
    {
        var normalizedName = request.Name.Trim();

        // Check duplicate class name
        var exists = await _context.Classes
            .AnyAsync(
                c => c.Name == normalizedName,
                cancellationToken
            );

        if (exists)
        {
            throw new InvalidOperationException(
       "A class with this name already exists.");
        }

        var schoolClass = new SchoolClass
        {
            Id = Guid.NewGuid(),
            Name = normalizedName,
            TotalSeats = request.TotalSeats
        };

        _context.Classes.Add(schoolClass);

        await _context.SaveChangesAsync(cancellationToken);

        return new ClassResponse(
            schoolClass.Id,
            schoolClass.Name,
            schoolClass.TotalSeats,
            0,
            0,
            schoolClass.TotalSeats
        );
    }

    public async Task<IReadOnlyList<ClassResponse>> GetAllAsync(
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        return await _context.Classes
            .AsNoTracking()
            .Select(c => new ClassResponse(
                c.Id,
                c.Name,
                c.TotalSeats,

                c.Holds.Count(h =>
                    h.Status == HoldStatus.HELD &&
                    h.ExpiresAt > now),

                c.Holds.Count(h =>
                    h.Status == HoldStatus.CONFIRMED),

                c.TotalSeats -
                c.Holds.Count(h =>
                    h.Status == HoldStatus.HELD &&
                    h.ExpiresAt > now) -
                c.Holds.Count(h =>
                    h.Status == HoldStatus.CONFIRMED)
            ))
            .ToListAsync(cancellationToken);
    }

    public async Task<ClassResponse?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        return await _context.Classes
            .AsNoTracking()
            .Where(c => c.Id == id)
            .Select(c => new ClassResponse(
                c.Id,
                c.Name,
                c.TotalSeats,

                c.Holds.Count(h =>
                    h.Status == HoldStatus.HELD &&
                    h.ExpiresAt > now),

                c.Holds.Count(h =>
                    h.Status == HoldStatus.CONFIRMED),

                c.TotalSeats -
                c.Holds.Count(h =>
                    h.Status == HoldStatus.HELD &&
                    h.ExpiresAt > now) -
                c.Holds.Count(h =>
                    h.Status == HoldStatus.CONFIRMED)
            ))
            .FirstOrDefaultAsync(cancellationToken);
    }
}