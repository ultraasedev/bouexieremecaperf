// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import robots from '@/app/robots';
import sitemap from '@/app/sitemap';

describe('robots.txt', () => {
  it('should allow root path', () => {
    const config = robots();
    const rules = Array.isArray(config.rules) ? config.rules : [config.rules];
    expect(rules[0].allow).toContain('/');
  });

  it('should disallow /dashboard/', () => {
    const config = robots();
    const rules = Array.isArray(config.rules) ? config.rules : [config.rules];
    const disallowed = Array.isArray(rules[0].disallow) ? rules[0].disallow : [rules[0].disallow];
    expect(disallowed).toContain('/dashboard/');
  });

  it('should disallow /api/', () => {
    const config = robots();
    const rules = Array.isArray(config.rules) ? config.rules : [config.rules];
    const disallowed = Array.isArray(rules[0].disallow) ? rules[0].disallow : [rules[0].disallow];
    expect(disallowed).toContain('/api/');
  });

  it('should disallow /login', () => {
    const config = robots();
    const rules = Array.isArray(config.rules) ? config.rules : [config.rules];
    const disallowed = Array.isArray(rules[0].disallow) ? rules[0].disallow : [rules[0].disallow];
    expect(disallowed).toContain('/login');
  });

  it('should include sitemap URL', () => {
    const config = robots();
    expect(config.sitemap).toContain('/sitemap.xml');
  });
});

describe('sitemap.xml', () => {
  it('should include homepage with priority 1', () => {
    const entries = sitemap();
    const homepage = entries.find((e) => !e.url.includes('/blog') && !e.url.includes('/rdv') && !e.url.includes('/mentions'));
    expect(homepage).toBeDefined();
    expect(homepage!.priority).toBe(1);
  });

  it('should include /blog page', () => {
    const entries = sitemap();
    const blog = entries.find((e) => e.url.endsWith('/blog'));
    expect(blog).toBeDefined();
    expect(blog!.priority).toBe(0.8);
  });

  it('should include /rdv page', () => {
    const entries = sitemap();
    const rdv = entries.find((e) => e.url.endsWith('/rdv'));
    expect(rdv).toBeDefined();
  });

  it('should include /mentions-legales', () => {
    const entries = sitemap();
    const mentions = entries.find((e) => e.url.includes('mentions-legales'));
    expect(mentions).toBeDefined();
  });

  it('should include blog posts', () => {
    const entries = sitemap();
    const blogPosts = entries.filter((e) => e.url.includes('/blog/') && !e.url.endsWith('/blog'));
    expect(blogPosts.length).toBeGreaterThan(0);
  });

  it('should not include /dashboard or /api in sitemap', () => {
    const entries = sitemap();
    const dashboardEntries = entries.filter((e) => e.url.includes('/dashboard') || e.url.includes('/api'));
    expect(dashboardEntries.length).toBe(0);
  });
});
