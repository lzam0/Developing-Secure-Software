import crypto from 'crypto';
import { PostModel } from '../models/post.model.js';

function generateSlug(title) {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

function generateUniqueSlug(title) {
    const suffix = crypto.randomBytes(3).toString('hex');
    return `${suffix}-${generateSlug(title)}`;
}

export class PostsController {

    static async create(req, res, next) {
        try {
            const { title, tags, content } = req.body;
            const userid = req.user.id;

            const slug = generateUniqueSlug(title);
            const tagsArray = Array.isArray(tags) ? tags : [tags];

            const post = await PostModel.create(title, slug, tagsArray, content, userid);

            res.status(201).json({
                success: true,
                message: 'Post created successfully',
                data: { post }
            });
        } catch (error) {
            next(error);
        }
    }

    static async getAll(req, res, next) {
        try {
            const posts = await PostModel.findAll();
            res.status(200).json({
                success: true,
                data: { posts }
            });
        } catch (error) {
            next(error);
        }
    }

    static async getOne(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, message: 'Invalid post ID' });
            }

            const post = await PostModel.findById(id);
            if (!post) {
                return res.status(404).json({ success: false, message: 'Post not found' });
            }

            res.status(200).json({ success: true, data: { post } });
        } catch (error) {
            next(error);
        }
    }

    static async getOneBySlug(req, res, next) {
        try {
            const { slug } = req.params;

            const post = await PostModel.findBySlug(slug);
            if (!post) {
                return res.status(404).json({ success: false, message: 'Post not found' });
            }

            res.status(200).json({ success: true, data: { post } });
        } catch (error) {
            next(error);
        }
    }
}

export default PostsController;
