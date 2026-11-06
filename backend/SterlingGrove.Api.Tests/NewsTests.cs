using Microsoft.EntityFrameworkCore;
using SterlingGrove.Api.Controllers;
using SterlingGrove.Api.Models;
using static SterlingGrove.Api.Tests.TestUniversity;

namespace SterlingGrove.Api.Tests;

public class NewsTests : IDisposable
{
    private readonly TestUniversity uni = new();
    private readonly NewsController controller;

    public NewsTests() => controller = new NewsController(uni.Db);

    public void Dispose() => uni.Dispose();

    [Fact]
    public async Task List_is_newest_first_and_paged()
    {
        for (var i = 0; i < 5; i++)
            await uni.AddArticleAsync($"Article {i}", daysAgo: i);

        var page2 = await controller.List(null, null, null, page: 2, pageSize: 2);

        Assert.Equal(["Article 2", "Article 3"], page2.Items.Select(n => n.Title));
        Assert.Equal(5, page2.TotalCount);
        Assert.Equal(3, page2.TotalPages);
    }

    [Theory]
    [InlineData(0, 999, 1, 50)]
    [InlineData(-3, 0, 1, 1)]
    public async Task Silly_paging_values_are_brought_back_into_range(int page, int pageSize, int expectedPage, int expectedSize)
    {
        var result = await controller.List(null, null, null, page, pageSize);

        Assert.Equal(expectedPage, result.Page);
        Assert.Equal(expectedSize, result.PageSize);
    }

    [Fact]
    public async Task List_filters_by_search_category_and_featured()
    {
        await uni.AddArticleAsync("Quantum lab opens", "Research", featured: true);
        await uni.AddArticleAsync("Robotics title", "Student Life", summary: "A win in Quantum robotics");
        await uni.AddArticleAsync("Library plans", "Student Life");

        Assert.Equal(2, (await controller.List("Quantum", null, null)).TotalCount);
        Assert.Equal(2, (await controller.List(null, "Student Life", null)).TotalCount);
        Assert.Equal("Quantum lab opens", (await controller.List(null, null, true)).Items.Single().Title);
        Assert.Equal("Library plans", (await controller.List(null, "Student Life", false, 1, 1)).Items.Single().Title);
    }

    [Fact]
    public async Task Categories_are_distinct_and_sorted()
    {
        await uni.AddArticleAsync("A", "Sport");
        await uni.AddArticleAsync("B", "Research");
        await uni.AddArticleAsync("C", "Sport");

        Assert.Equal(["Research", "Sport"], await controller.Categories());
    }

    [Fact]
    public async Task Create_makes_the_slug_from_the_title_and_ignores_a_posted_id()
    {
        var result = await controller.Create(new NewsArticle { Id = 999, Title = "Falcons Win!" });

        Assert.Equal(201, StatusOf(result));
        var saved = await uni.Db.NewsArticles.SingleAsync();
        Assert.Equal("falcons-win", saved.Slug);
        Assert.NotEqual(999, saved.Id);
    }

    [Fact]
    public async Task Create_refuses_a_slug_that_is_taken()
    {
        await uni.AddArticleAsync("Falcons win");

        var result = await controller.Create(new NewsArticle { Title = "Falcons Win!" });

        Assert.Equal(409, StatusOf(result));
    }

    [Fact]
    public async Task Create_refuses_a_title_with_nothing_to_make_a_url_from_and_saves_nothing()
    {
        var result = await controller.Create(new NewsArticle { Title = "!!!" });

        Assert.Equal(400, StatusOf(result));
        Assert.Equal(0, await uni.Db.NewsArticles.CountAsync());
    }

    [Fact]
    public async Task Update_changes_the_article_and_can_keep_its_own_slug()
    {
        var article = await uni.AddArticleAsync("Old title");

        var result = await controller.Update(article.Id, new NewsArticle { Title = "New title", Slug = "old-title", Category = "Research" });

        Assert.Equal(204, StatusOf(result));
        uni.Forget();
        var saved = await uni.Db.NewsArticles.SingleAsync();
        Assert.Equal(("New title", "old-title", "Research"), (saved.Title, saved.Slug, saved.Category));
    }

    [Fact]
    public async Task Update_refuses_another_articles_slug_and_an_empty_one()
    {
        await uni.AddArticleAsync("Taken");
        var article = await uni.AddArticleAsync("Mine");

        Assert.Equal(409, StatusOf(await controller.Update(article.Id, new NewsArticle { Title = "Taken" })));
        Assert.Equal(400, StatusOf(await controller.Update(article.Id, new NewsArticle { Title = "!!!" })));
    }

    [Fact]
    public async Task Update_and_delete_report_unknown_articles()
    {
        Assert.Equal(404, StatusOf(await controller.Update(123, new NewsArticle { Title = "Nope" })));
        Assert.Equal(404, StatusOf(await controller.Delete(123)));
    }

    [Fact]
    public async Task Delete_removes_the_article()
    {
        var article = await uni.AddArticleAsync("Going");

        Assert.Equal(204, StatusOf(await controller.Delete(article.Id)));
        Assert.Equal(0, await uni.Db.NewsArticles.CountAsync());
    }
}
