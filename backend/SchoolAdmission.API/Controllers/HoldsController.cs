using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;
using SchoolAdmission.Application.Interfaces.Services;

namespace SchoolAdmission.API.Controllers;

[ApiController]
[Route("classes/{classId:guid}/holds")]
public sealed class HoldsController : ControllerBase
{
    private readonly IHoldService _holdService;

    public HoldsController(IHoldService holdService)
    {
        _holdService = holdService;
    }

    [HttpPost]
    [ProducesResponseType(StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create(
        Guid classId,
        [FromHeader(Name = "X-Student-Id")] string? studentId,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(studentId) ||
            !Regex.IsMatch(studentId, @"^[0-9]{17}$"))
        {
            return BadRequest(new
            {
                message = "X-Student-Id must contain exactly 17 digits."
            });
        }

        try
        {
            var result = await _holdService.CreateAsync(
                classId,
                studentId,
                cancellationToken);

            return StatusCode(
                StatusCodes.Status201Created,
                new
                {
                    holdId = result.HoldId,
                    classId = result.ClassId,
                    studentId = result.StudentId,
                    status = result.Status,
                    expiresAt = result.ExpiresAt
                });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }
}