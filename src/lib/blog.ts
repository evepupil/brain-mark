import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// 博客文章目录
const POSTS_DIR = path.join(process.cwd(), 'content', 'blog');

/**
 * 博客文章元数据
 */
export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  author?: string;
  tags?: string[];
  content: string;
}

/**
 * 获取所有博客文章
 */
export function getAllPosts(): BlogPost[] {
  // 确保目录存在
  if (!fs.existsSync(POSTS_DIR)) {
    return [];
  }

  const files = fs.readdirSync(POSTS_DIR);
  const posts = files
    .filter(file => file.endsWith('.md'))
    .map(file => {
      const slug = file.replace(/\.md$/, '');
      const fullPath = path.join(POSTS_DIR, file);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      return {
        slug,
        title: data.title || slug,
        description: data.description || '',
        date: data.date || '',
        author: data.author,
        tags: data.tags || [],
        content,
      };
    })
    .sort((a, b) => (a.date > b.date ? -1 : 1));

  return posts;
}

/**
 * 根据slug获取博客文章
 */
export function getPostBySlug(slug: string): BlogPost | null {
  const fullPath = path.join(POSTS_DIR, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  return {
    slug,
    title: data.title || slug,
    description: data.description || '',
    date: data.date || '',
    author: data.author,
    tags: data.tags || [],
    content,
  };
}

/**
 * 获取所有文章的slug
 */
export function getAllPostSlugs(): string[] {
  if (!fs.existsSync(POSTS_DIR)) {
    return [];
  }

  const files = fs.readdirSync(POSTS_DIR);
  return files
    .filter(file => file.endsWith('.md'))
    .map(file => file.replace(/\.md$/, ''));
}
