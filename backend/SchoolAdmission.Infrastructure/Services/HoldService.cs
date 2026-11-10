using Microsoft.EntityFrameworkCore;
using SchoolAdmission.Application.DTOs.Holds;
using SchoolAdmission.Application.Interfaces.Services;
using SchoolAdmission.Domain;
using SchoolAdmission.Domain.Entities;
using SchoolAdmission.Infrastructure.Persistence;

namespace SchoolAdmission.Infrastructure.Services;

public sealed class HoldService : IHoldService
{
    private readonly ApplicationDbContext _context;

    public HoldService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<CreateHoldResponse> CreateAsync(
        Guid classId,
        string studentId,
        CancellationToken cancellationToken = default)
    {
        var holdDuration = int.TryParse(
            Environment.GetEnvironmentVariable("HOLD_DURATION_SECONDS"),
            out var seconds) && seconds > 0
                ? seconds
                : 600;

        await using var transaction =
            await _context.Database.BeginTransactionAsync(cancellationToken);

        // Lock the class row to prevent concurrent seat allocation.
        var locked = await _context.Database.ExecuteSqlInterpolatedAsync(
            $"""SELECT "Id" FROM classes WHERE "Id" = {classId} FOR UPDATE""",
            cancellationToken);

        // ExecuteSqlInterpolatedAsync does not return SELECT rows.
        // Check existence using EF after acquiring the row lock.
        var schoolClass = await _context.Classes
            .FirstOrDefaultAsync(c => c.Id == classId, cancellationToken);

        if (schoolClass is null)
        {
            throw new KeyNotFoundException("Class not found.");
        }

        var now = DateTime.UtcNow;

        // Expire old holds for this class.
        await _context.Holds
            .Where(h =>
                h.ClassId == classId &&
                h.Status == HoldStatus.HELD &&
                h.ExpiresAt <= now)
            .ExecuteUpdateAsync(
                setters => setters.SetProperty(
                    h => h.Status,
                    HoldStatus.EXPIRED),
                cancellationToken);

        // Check whether the student already has an active application.
        var hasActiveHold = await _context.Holds.AnyAsync(
            h => h.ClassId == classId &&
                 h.StudentId == studentId &&
                 (h.Status == HoldStatus.CONFIRMED ||
                  (h.Status == HoldStatus.HELD && h.ExpiresAt > now)),
            cancellationToken);

        if (hasActiveHold)
        {
            throw new InvalidOperationException(
                "You already have an active application for this class.");
        }

        // Count held and confirmed seats.
        var occupiedSeats = await _context.Holds.CountAsync(
            h => h.ClassId == classId &&
                 (h.Status == HoldStatus.CONFIRMED ||
                  (h.Status == HoldStatus.HELD && h.ExpiresAt > now)),
            cancellationToken);

        if (occupiedSeats >= schoolClass.TotalSeats)
        {
            throw new InvalidOperationException(
                "No seats are available for this class.");
        }

        var hold = new Hold
        {
            Id = Guid.NewGuid(),
            ClassId = classId,
            StudentId = studentId,
            Status = HoldStatus.HELD,
            CreatedAt = now,
            ExpiresAt = now.AddSeconds(holdDuration)
        };

        _context.Holds.Add(hold);

        await _context.SaveChangesAsync(cancellationToken);

        await transaction.CommitAsync(cancellationToken);

        return new CreateHoldResponse(
            hold.Id,
            hold.ClassId,
            hold.StudentId,
            "HELD",
            hold.ExpiresAt.UtcDateTime
        );
    }
}