using FluentValidation;
using SchoolAdmission.Application.DTOs.Classes;

namespace SchoolAdmission.Application.Validators.Classes;

public sealed class CreateClassRequestValidator
    : AbstractValidator<CreateClassRequest>
{
    public CreateClassRequestValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty()
            .WithMessage("Class name is required.")
            .MaximumLength(150)
            .WithMessage("Class name cannot exceed 150 characters.");

        RuleFor(x => x.TotalSeats)
            .GreaterThan(0)
            .WithMessage("Total seats must be greater than zero.");
    }
}