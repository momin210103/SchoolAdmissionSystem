using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Mvc;
using SchoolAdmission.Application.DTOs.Holds;
using SchoolAdmission.Application.Interfaces.Services;

namespace SchoolAdmission.API.Controllers;

[ApiController]
[Route("me/holds")]
public sealed class MyHoldsController : ControllerBase
{
    private readonly IHoldService _holdService;

    public MyHoldsController(IHoldService holdService)
    {
        _holdService = holdService;
    }

    [HttpGet]
    [ProducesResponseType(
        typeof(IReadOnlyList<MyHoldResponse>),
        StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> GetMyHolds(
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

        var result = await _holdService.GetMyHoldsAsync(
            studentId,
            cancellationToken);

        return Ok(result);
    }
}