using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
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

    public async Task<HoldConfirmResponse> ConfirmAsync(Guid holdId, string studentId, CancellationToken cancellationToken)
    {
        await using var transaction =
        await _context.Database.BeginTransactionAsync(cancellationToken);

        // Lock the hold row to prevent concurrent confirmation/cancellation.
        var connection = _context.Database.GetDbConnection();

        await using var command = connection.CreateCommand();

        command.Transaction = transaction.GetDbTransaction();

        command.CommandText = """
        SELECT "Id"
        FROM holds
        WHERE "Id" = @holdId
        FOR UPDATE
        """;

        var parameter = command.CreateParameter();
        parameter.ParameterName = "holdId";
        parameter.Value = holdId;
        command.Parameters.Add(parameter);

        var lockedHoldId = await command.ExecuteScalarAsync(cancellationToken);

        if (lockedHoldId is null)
        {
            await transaction.RollbackAsync(cancellationToken);
            throw new KeyNotFoundException("Admission hold not found.");
        }

        // Load the hold as a tracked entity because it may be updated.
        var hold = await _context.Holds
            .FirstAsync(h => h.Id == holdId, cancellationToken);

        // Verify ownership before exposing or changing the hold.
        if (hold.StudentId != studentId)
        {
            await transaction.RollbackAsync(cancellationToken);
            throw new UnauthorizedAccessException(
                "You are not authorized to confirm this admission hold.");
        }

        // Idempotency: repeated confirmation must not change the result.
        if (hold.Status == HoldStatus.CONFIRMED)
        {
            await transaction.CommitAsync(cancellationToken);

            return new HoldConfirmResponse(
                hold.Id,
                "CONFIRMED");
        }

        if (hold.Status == HoldStatus.CANCELLED)
        {
            await transaction.RollbackAsync(cancellationToken);
            throw new InvalidOperationException(
                "This admission hold has been cancelled.");
        }

        if (hold.Status == HoldStatus.EXPIRED)
        {
            await transaction.RollbackAsync(cancellationToken);
            throw new InvalidOperationException(
                "This admission hold has expired.");
        }

        var now = DateTime.UtcNow;

        // An expired hold cannot be confirmed.
        if (hold.ExpiresAt <= now)
        {
            hold.Status = HoldStatus.EXPIRED;

            await _context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            throw new InvalidOperationException(
                "This admission hold has expired.");
        }

        hold.Status = HoldStatus.CONFIRMED;
        hold.ConfirmedAt = now;

        await _context.SaveChangesAsync(cancellationToken);

        await transaction.CommitAsync(cancellationToken);

        return new HoldConfirmResponse(
            hold.Id,
            "CONFIRMED");
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

    public async Task<HoldResponse?> GetByIdAsync(
    Guid holdId,
    CancellationToken cancellationToken = default)
    {
        var hold = await _context.Holds
            .AsNoTracking()
            .FirstOrDefaultAsync(
                h => h.Id == holdId,
                cancellationToken);

        if (hold is null)
        {
            return null;
        }

        // Calculate effective status.
        var status = hold.Status.ToString().ToUpperInvariant();

        if (status == "HELD" && hold.ExpiresAt <= DateTime.UtcNow)
        {
            status = "EXPIRED";
        }

        return new HoldResponse(
            hold.Id,
            hold.ClassId,
            status,
            hold.ExpiresAt.UtcDateTime
        );
    }
}
