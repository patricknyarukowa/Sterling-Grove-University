using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SterlingGrove.Api.Data;
using SterlingGrove.Api.Models;

namespace SterlingGrove.Api.Controllers;

[ApiController]
[Route("api/events")]
public class EventsController(AppDbContext db) : ControllerBase
{
    // READ (list) — GET /api/events?upcoming=true&take=4
    [HttpGet]
    public async Task<List<CampusEvent>> List(bool upcoming = false, int? take = null)
    {
        var query = db.Events.AsNoTracking();
        if (upcoming)
            query = query.Where(e => (e.EndsAt ?? e.StartsAt) >= DateTime.UtcNow);

        query = upcoming ? query.OrderBy(e => e.StartsAt) : query.OrderByDescending(e => e.StartsAt);
        if (take is > 0)
            query = query.Take(take.Value);

        return await query.ToListAsync();
    }

    // READ (one) — GET /api/events/4
    [HttpGet("{id:int}")]
    public async Task<ActionResult<CampusEvent>> Get(int id)
    {
        var item = await db.Events.FindAsync(id);
        return item is null ? NotFound() : item;
    }

    // CREATE — POST /api/events
    [HttpPost, Authorize(Roles = Roles.Admin)]
    public async Task<ActionResult<CampusEvent>> Create(CampusEvent input)
    {
        if (input.EndsAt < input.StartsAt)
            return BadRequest(new { message = "The event can't end before it starts." });

        input.Id = 0;
        db.Events.Add(input);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = input.Id }, input);
    }

    // UPDATE — PUT /api/events/4
    [HttpPut("{id:int}"), Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Update(int id, CampusEvent input)
    {
        var item = await db.Events.FindAsync(id);
        if (item is null) return NotFound();
        if (input.EndsAt < input.StartsAt)
            return BadRequest(new { message = "The event can't end before it starts." });

        item.Title = input.Title;
        item.Description = input.Description;
        item.StartsAt = input.StartsAt;
        item.EndsAt = input.EndsAt;
        item.Location = input.Location;
        item.Category = input.Category;
        await db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE — DELETE /api/events/4
    [HttpDelete("{id:int}"), Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await db.Events.Where(e => e.Id == id).ExecuteDeleteAsync();
        return deleted == 0 ? NotFound() : NoContent();
    }
}
