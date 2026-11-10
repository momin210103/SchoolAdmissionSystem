using Microsoft.AspNetCore.Mvc;
using SchoolAdmission.Application.DTOs.Classes;
using SchoolAdmission.Application.Interfaces.Services;

namespace SchoolAdmission.API.Controllers;

[ApiController]
[Route("api/classes")]
public sealed class ClassesController : ControllerBase
{
    private readonly IClassService _classService;

    public ClassesController(IClassService classService)
    {
        _classService = classService;
    }

    [HttpPost]
    [ProducesResponseType(typeof(ClassResponse), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create(
        [FromBody] CreateClassRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _classService.CreateAsync(
            request, cancellationToken);

        return CreatedAtAction(
            nameof(GetById),
            new { classId = result.Id },
            result);
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<ClassResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        CancellationToken cancellationToken)
    {
        var result = await _classService.GetAllAsync(cancellationToken);

        return Ok(result);
    }

    [HttpGet("{classId:guid}")]
    [ProducesResponseType(typeof(ClassResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(
        Guid classId,
        CancellationToken cancellationToken)
    {
        var result = await _classService.GetByIdAsync(
            classId, cancellationToken);

        if (result is null)
        {
            return NotFound(new
            {
                message = "Class not found."
            });
        }

        return Ok(result);
    }
}