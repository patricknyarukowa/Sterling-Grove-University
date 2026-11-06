using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using SterlingGrove.Api.Data;
using SterlingGrove.Api.Models;

namespace SterlingGrove.Api.Controllers;

[ApiController]
[Route("api/contact")]
public class ContactController(AppDbContext db) : ControllerBase
{
    // CREATE (public) — POST /api/contact  (the Contact Us form)
    [HttpPost, EnableRateLimiting(Policies.Contact)]
    public async Task<IActionResult> Submit(ContactMessage input)
    {
        // Only take the fields a visitor is allowed to set
        db.ContactMessages.Add(new ContactMessage
        {
            Name = input.Name,
            Email = input.Email,
            Subject = input.Subject,
            Message = input.Message
        });
        await db.SaveChangesAsync();
        return Ok(new { message = "Thank you. Our team will get back to you shortly." });
    }

    // READ (admin inbox) — GET /api/contact
    [HttpGet, Authorize(Roles = Roles.Admin)]
    public async Task<List<ContactMessage>> Inbox() =>
        await db.ContactMessages.OrderBy(m => m.IsRead).ThenByDescending(m => m.CreatedAt).ToListAsync();

    // UPDATE — PUT /api/contact/5/read?isRead=true
    [HttpPut("{id:int}/read"), Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> MarkRead(int id, bool isRead = true)
    {
        var updated = await db.ContactMessages.Where(m => m.Id == id)
            .ExecuteUpdateAsync(s => s.SetProperty(m => m.IsRead, isRead));
        return updated == 0 ? NotFound() : NoContent();
    }

    // DELETE — DELETE /api/contact/5
    [HttpDelete("{id:int}"), Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await db.ContactMessages.Where(m => m.Id == id).ExecuteDeleteAsync();
        return deleted == 0 ? NotFound() : NoContent();
    }
}
