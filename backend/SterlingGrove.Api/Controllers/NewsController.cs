using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SterlingGrove.Api.Data;
using SterlingGrove.Api.Models;

namespace SterlingGrove.Api.Controllers;

[ApiController]
[Route("api/news")]
public class NewsController(AppDbContext db) : ControllerBase
{
    // READ (paged list) — GET /api/news?q=research&category=Research&featured=true&page=1&pageSize=9
    [HttpGet]
    public async Task<PagedResult<NewsArticle>> List(string? q, string? category, bool? featured, int page = 1, int pageSize = 9)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 50);

        var query = db.NewsArticles.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(q))
            query = query.Where(n => n.Title.Contains(q) || n.Summary.Contains(q));
        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(n => n.Category == category);
        if (featured is not null)
            query = query.Where(n => n.IsFeatured == featured);

        var total = await query.CountAsync();
        var items = await query
            .OrderByDescending(n => n.PublishedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PagedResult<NewsArticle>(items, page, pageSize, total);
    }

    // GET /api/news/categories — distinct categories for the filter chips
    [HttpGet("categories")]
    public async Task<List<string>> Categories() =>
        await db.NewsArticles.Select(n => n.Category).Distinct().OrderBy(c => c).ToListAsync();

    // READ (one, public) — GET /api/news/falcons-launch-quantum-lab
    [HttpGet("{slug}")]
    public async Task<ActionResult<NewsArticle>> GetBySlug(string slug)
    {
        var article = await db.NewsArticles.AsNoTracking().FirstOrDefaultAsync(n => n.Slug == slug);
        return article is null ? NotFound() : article;
    }

    // READ (one, admin edit form) — GET /api/news/id/12
    [HttpGet("id/{id:int}")]
    public async Task<ActionResult<NewsArticle>> GetById(int id)
    {
        var article = await db.NewsArticles.FindAsync(id);
        return article is null ? NotFound() : article;
    }

    // CREATE — POST /api/news
    [HttpPost, Authorize(Roles = Roles.Admin)]
    public async Task<ActionResult<NewsArticle>> Create(NewsArticle input)
    {
        input.Id = 0;
        input.Slug = SlugHelper.Create(string.IsNullOrWhiteSpace(input.Slug) ? input.Title : input.Slug);
        if (input.Slug.Length == 0)
            return BadRequest(new { message = "The title needs at least one letter or number." });
        if (await db.NewsArticles.AnyAsync(n => n.Slug == input.Slug))
            return Conflict(new { message = "An article with that slug already exists." });

        db.NewsArticles.Add(input);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetBySlug), new { slug = input.Slug }, input);
    }

    // UPDATE — PUT /api/news/12
    [HttpPut("{id:int}"), Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Update(int id, NewsArticle input)
    {
        var article = await db.NewsArticles.FindAsync(id);
        if (article is null) return NotFound();

        var slug = SlugHelper.Create(string.IsNullOrWhiteSpace(input.Slug) ? input.Title : input.Slug);
        if (slug.Length == 0)
            return BadRequest(new { message = "The title needs at least one letter or number." });
        if (await db.NewsArticles.AnyAsync(n => n.Slug == slug && n.Id != id))
            return Conflict(new { message = "An article with that slug already exists." });

        article.Title = input.Title;
        article.Slug = slug;
        article.Summary = input.Summary;
        article.Body = input.Body;
        article.Category = input.Category;
        article.Author = input.Author;
        article.PublishedAt = input.PublishedAt;
        article.IsFeatured = input.IsFeatured;
        await db.SaveChangesAsync();
        return NoContent();
    }

    // DELETE — DELETE /api/news/12
    [HttpDelete("{id:int}"), Authorize(Roles = Roles.Admin)]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await db.NewsArticles.Where(n => n.Id == id).ExecuteDeleteAsync();
        return deleted == 0 ? NotFound() : NoContent();
    }
}
