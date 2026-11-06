using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SterlingGrove.Api.Data;
using SterlingGrove.Api.Models;

namespace SterlingGrove.Api.Controllers;

[ApiController]
[Route("api/testimonials")]
public class TestimonialsController(AppDbContext db) : ControllerBase
{
    // READ — GET /api/testimonials
    [HttpGet]
    public async Task<List<Testimonial>> List() =>
        await db.Testimonials.AsNoTracking().OrderBy(t => t.Id).ToListAsync();

    // CREATE — POST /api/testimonials
    [HttpPost, Authorize(Roles = Roles.Admin)]
    public async Task<ActionResult<Testimonial>> Create(Testimonial input)
    {
        input.Id = 0;
        db.Testimonials.Add(input);
        await db.SaveChangesAsync();
        return Created($"/api/testimonials/{input.Id}", input);
    }

    // UPDATE — PUT /api/testimonials/2
    [HttpPut("{id:int}"), Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Update(int id, Testimonial input)
    {
        var item = await db.Testimonials.FindAsync(id);
        if (item is null) return NotFound();

        item.StudentName = input.StudentName;
        item.Programme = input.Programme;
        item.Quote = input.Quote;
        await db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE — DELETE /api/testimonials/2
    [HttpDelete("{id:int}"), Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await db.Testimonials.Where(t => t.Id == id).ExecuteDeleteAsync();
        return deleted == 0 ? NotFound() : NoContent();
    }
}
