using System.ComponentModel.DataAnnotations;

namespace SchoolAdmission.Application.DTOs.Classes;

public sealed record CreateClassRequest(
    [Required]
    [StringLength(100, MinimumLength = 5)]
    string Name,

    [Range(1, int.MaxValue)]
    int TotalSeats
);