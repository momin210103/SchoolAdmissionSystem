namespace SchoolAdmission.Domain.Entities;

public class Hold
{
    public Guid Id { get; set; }
    public Guid ClassId { get; set; }
    public string StudentId { get; set; } = null!;
    public HoldStatus Status { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? ConfirmedAt { get; set; }
    public DateTimeOffset? CancelledAt { get; set; }

    public SchoolClass? Class { get; set; }
}