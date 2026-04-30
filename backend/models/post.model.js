import pool from "../controllers/database.js";

export class PostModel {

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

    static async findById(id) {
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
        WHERE p.postid = $1`;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    static async slugExists(slug) {
        const result = await pool.query(
            'SELECT 1 FROM posts WHERE slug = $1 LIMIT 1',
            [slug]
        );
        return result.rows.length > 0;
    }
}

export default PostModel;
