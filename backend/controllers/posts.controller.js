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

    static async getOneByHex(req, res, next) {
        try {
            const { hex } = req.params;

            if (!/^[a-f0-9]{6}$/.test(hex)) {
                return res.status(400).json({ success: false, message: 'Invalid post identifier' });
            }

            const post = await PostModel.findByHex(hex);
            if (!post) {
                return res.status(404).json({ success: false, message: 'Post not found' });
            }

            const isAuthor = req.user?.id === post.userid;
            const isSubscriber = req.user?.is_subscribed === true;
            const hasFullAccess = isAuthor || isSubscriber;

            if (!hasFullAccess) {
                const teaser = post.content.split(/\n+/).find(p => p.trim()) || '';
                post.content = teaser;
            }

            res.status(200).json({
                success: true,
                data: { post, access: hasFullAccess ? 'full' : 'teaser' }
            });
        } catch (error) {
            next(error);
        }
    }

    static async update(req, res, next) {
        try {
            const id = parseInt(req.params.id, 10);
            if (isNaN(id)) {
                return res.status(400).json({ success: false, message: 'Invalid post ID' });
            }

            const post = await PostModel.findById(id);
            if (!post) {
                return res.status(404).json({ success: false, message: 'Post not found' });
            }

            if (post.userid !== req.user.id) {
                return res.status(403).json({ success: false, message: 'Forbidden' });
            }

            const { title, tags, content } = req.body;
            const tagsArray = Array.isArray(tags) ? tags : [tags];

            const updated = await PostModel.update(id, title, tagsArray, content);
            res.status(200).json({ success: true, data: { post: updated } });
        } catch (error) {
            next(error);
        }
    }
}

export default PostsController;
