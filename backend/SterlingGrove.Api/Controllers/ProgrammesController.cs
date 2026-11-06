using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SterlingGrove.Api.Data;
using SterlingGrove.Api.Models;

namespace SterlingGrove.Api.Controllers;

[ApiController]
[Route("api/programmes")]
public class ProgrammesController(AppDbContext db) : ControllerBase
{
    public record ProgrammeView(int Id, string Title, string Code, ProgrammeLevel Level, decimal DurationYears,
        string Summary, string AdmissionRequirements, int FacultyId, string FacultyName, string FacultySlug);

    // READ (search) — GET /api/programmes?q=data&level=Masters&facultyId=2
    [HttpGet]
    public async Task<List<ProgrammeView>> Search(string? q, ProgrammeLevel? level, int? facultyId)
    {
        var query = db.Programmes.AsQueryable();

        if (!string.IsNullOrWhiteSpace(q))
            query = query.Where(p => p.Title.Contains(q) || p.Code.Contains(q) || p.Summary.Contains(q));
        if (level is not null)
            query = query.Where(p => p.Level == level);
        if (facultyId is not null)
            query = query.Where(p => p.FacultyId == facultyId);

        return await query
            .OrderBy(p => p.Title)
            .Select(p => new ProgrammeView(p.Id, p.Title, p.Code, p.Level, p.DurationYears, p.Summary,
                p.AdmissionRequirements, p.FacultyId, p.Faculty!.Name, p.Faculty.Slug))
            .ToListAsync();
    }

    // READ (one) — GET /api/programmes/7
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProgrammeView>> Get(int id)
    {
        var p = await db.Programmes
            .Where(p => p.Id == id)
            .Select(p => new ProgrammeView(p.Id, p.Title, p.Code, p.Level, p.DurationYears, p.Summary,
                p.AdmissionRequirements, p.FacultyId, p.Faculty!.Name, p.Faculty.Slug))
            .FirstOrDefaultAsync();
        return p is null ? NotFound() : p;
    }

    // CREATE — POST /api/programmes
    [HttpPost, Authorize(Roles = Roles.Admin)]
    public async Task<ActionResult<Programme>> Create(Programme input)
    {
        if (!await db.Faculties.AnyAsync(f => f.Id == input.FacultyId))
            return BadRequest(new { message = "Unknown faculty." });
        if (await db.Programmes.AnyAsync(p => p.Code == input.Code))
            return Conflict(new { message = "A programme with that code already exists." });

        input.Id = 0;
        input.Faculty = null;
        db.Programmes.Add(input);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = input.Id }, input);
    }

    // UPDATE — PUT /api/programmes/7
    [HttpPut("{id:int}"), Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Update(int id, Programme input)
    {
        var programme = await db.Programmes.FindAsync(id);
        if (programme is null) return NotFound();
        if (!await db.Faculties.AnyAsync(f => f.Id == input.FacultyId))
            return BadRequest(new { message = "Unknown faculty." });
        if (await db.Programmes.AnyAsync(p => p.Code == input.Code && p.Id != id))
            return Conflict(new { message = "A programme with that code already exists." });

        programme.Title = input.Title;
        programme.Code = input.Code;
        programme.Level = input.Level;
        programme.DurationYears = input.DurationYears;
        programme.Summary = input.Summary;
        programme.AdmissionRequirements = input.AdmissionRequirements;
        programme.FacultyId = input.FacultyId;
        await db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE — DELETE /api/programmes/7
    [HttpDelete("{id:int}"), Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await db.Programmes.Where(p => p.Id == id).ExecuteDeleteAsync();
        return deleted == 0 ? NotFound() : NoContent();
    }
}
