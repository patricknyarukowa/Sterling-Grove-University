using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SterlingGrove.Api.Data;
using SterlingGrove.Api.Models;

namespace SterlingGrove.Api.Controllers;

[ApiController]
[Route("api/faculties")]
public class FacultiesController(AppDbContext db) : ControllerBase
{
    public record FacultySummary(int Id, string Name, string Slug, string Tagline, string Description, string DeanName, string Icon, int ProgrammeCount);
    public record FacultyDetail(Faculty Faculty, List<Programme> Programmes);

    // READ (list) — GET /api/faculties
    [HttpGet]
    public async Task<List<FacultySummary>> GetAll() =>
        await db.Faculties
            .OrderBy(f => f.Name)
            .Select(f => new FacultySummary(f.Id, f.Name, f.Slug, f.Tagline, f.Description, f.DeanName, f.Icon, f.Programmes.Count))
            .ToListAsync();

    // READ (one) — GET /api/faculties/engineering-technology
    [HttpGet("{slug}")]
    public async Task<ActionResult<FacultyDetail>> GetBySlug(string slug)
    {
        var faculty = await db.Faculties.AsNoTracking().FirstOrDefaultAsync(f => f.Slug == slug);
        if (faculty is null) return NotFound();

        var programmes = await db.Programmes.AsNoTracking()
            .Where(p => p.FacultyId == faculty.Id)
            .OrderBy(p => p.Level).ThenBy(p => p.Title)
            .ToListAsync();

        return new FacultyDetail(faculty, programmes);
    }

    // CREATE — POST /api/faculties
    [HttpPost, Authorize(Roles = Roles.Admin)]
    public async Task<ActionResult<Faculty>> Create(Faculty input)
    {
        input.Id = 0;
        input.Slug = SlugHelper.Create(string.IsNullOrWhiteSpace(input.Slug) ? input.Name : input.Slug);
        if (input.Slug.Length == 0)
            return BadRequest(new { message = "The name needs at least one letter or number." });
        if (await db.Faculties.AnyAsync(f => f.Slug == input.Slug))
            return Conflict(new { message = "A faculty with that slug already exists." });

        db.Faculties.Add(input);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetBySlug), new { slug = input.Slug }, input);
    }

    // UPDATE — PUT /api/faculties/3
    [HttpPut("{id:int}"), Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Update(int id, Faculty input)
    {
        var faculty = await db.Faculties.FindAsync(id);
        if (faculty is null) return NotFound();

        var slug = SlugHelper.Create(string.IsNullOrWhiteSpace(input.Slug) ? input.Name : input.Slug);
        if (slug.Length == 0)
            return BadRequest(new { message = "The name needs at least one letter or number." });
        if (await db.Faculties.AnyAsync(f => f.Slug == slug && f.Id != id))
            return Conflict(new { message = "A faculty with that slug already exists." });

        faculty.Name = input.Name;
        faculty.Slug = slug;
        faculty.Tagline = input.Tagline;
        faculty.Description = input.Description;
        faculty.DeanName = input.DeanName;
        faculty.Icon = input.Icon;
        await db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE — DELETE /api/faculties/3
    [HttpDelete("{id:int}"), Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Delete(int id)
    {
        var faculty = await db.Faculties.FindAsync(id);
        if (faculty is null) return NotFound();
        if (await db.Programmes.AnyAsync(p => p.FacultyId == id))
            return Conflict(new { message = "Move or delete this faculty's programmes first." });

        db.Faculties.Remove(faculty);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
