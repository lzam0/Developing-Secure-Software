import pool from "../controllers/database.js";

export class PostModel {

    // Create a new post
    static async create(title, slug, tags, content, userid) {
        const query = `
        INSERT INTO posts (title, slug, tags, content, userid)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
            postid AS id,
            title,
            slug,
            tags,
            content,
            userid,
            created_at`;
        const result = await pool.query(query, [title, slug, tags, content, userid]);
        return result.rows[0];

    }

    // Get all posts with author username
    static async findAll() {
        const query = `
        SELECT
            p.postid AS id,
            p.title,
            p.slug,
            p.tags,
            p.content,
            p.userid,
            p.created_at,
            u.username
        FROM posts p
        JOIN users u ON p.userid = u.userid
        ORDER BY p.created_at DESC`;
        const result = await pool.query(query);
        return result.rows;
    }

    // Get a single post by slug with author username
    static async findBySlug(slug) {
        const query = `
        SELECT
            p.postid AS id,
            p.title,
            p.slug,
            p.tags,
            p.content,
            p.userid,
            p.created_at,
            u.username
        FROM posts p
        JOIN users u ON p.userid = u.userid
        WHERE p.slug = $1`;
        const result = await pool.query(query, [slug]);
        return result.rows[0];
    }

    // Get a single post by hex with author username
    static async findByHex(hex) {
        const query = `
        SELECT
            p.postid AS id,
            p.title,
            p.slug,
            p.tags,
            p.content,
            p.userid,
            p.created_at,
            u.username
        FROM posts p
        JOIN users u ON p.userid = u.userid
        WHERE p.slug LIKE $1 || '-%'
        LIMIT 1`;
        const result = await pool.query(query, [hex]);
        return result.rows[0];
    }

    // Update a post by ID
    static async update(id, title, tags, content) {
        const query = `
        UPDATE posts
        SET title = $1, tags = $2, content = $3, updated_at = NOW()
        WHERE postid = $4
        RETURNING
            postid AS id,
            title,
            slug,
            tags,
            content,
            userid,
            created_at,
            updated_at`;
        const result = await pool.query(query, [title, tags, content, id]);
        return result.rows[0];
    }

}

export default PostModel;
