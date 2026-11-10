using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;
using SchoolAdmission.Application.DTOs.Holds;
using SchoolAdmission.Application.Interfaces.Services;

namespace SchoolAdmission.API.Controllers;

[ApiController]
// [Route("classes/{classId:guid}/holds")]
public sealed class HoldsController : ControllerBase

{
    private readonly IHoldService _holdService;

    public HoldsController(IHoldService holdService)
    {
        _holdService = holdService;
    }

    [HttpPost("classes/{classId:guid}/holds")]
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

    [HttpGet("holds/{holdId:guid}")]
    [ProducesResponseType(
           typeof(HoldResponse),
           StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(
           Guid holdId,
           CancellationToken cancellationToken)
    {
        var result = await _holdService.GetByIdAsync(
            holdId,
            cancellationToken);

        if (result is null)
        {
            return NotFound(new
            {
                message = "Hold not found."
            });
        }

        return Ok(result);
    }

    
    
    
    [HttpPost("/holds/{holdId:guid}/confirm")]
    [ProducesResponseType(
        typeof(HoldConfirmResponse),
        StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Confirm(
        Guid holdId,
        [FromHeader(Name = "X-Student-Id")] string? studentId,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(studentId) ||
            !System.Text.RegularExpressions.Regex.IsMatch(
                studentId, @"^[0-9]{17}$"))
        {
            return BadRequest(new
            {
                message = "X-Student-Id must contain exactly 17 digits."
            });
        }

        try
        {
            var result = await _holdService.ConfirmAsync(
                holdId,
                studentId,
                cancellationToken);

            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }
}




