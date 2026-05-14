import crypto from 'crypto';
import { PostModel } from '../models/post.model.js';

// Utility function to generate a URL-friendly slug from the post title
// This function converts the title to lowercase, removes special characters, and replaces spaces with hyphens
// Example: "My First Post!" -> "my-first-post"
function generateSlug(title) {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
}

// Generates a unique slug by prefixing the slugified title with a random 6-character hexadecimal string
function generateUniqueSlug(title) {
    const suffix = crypto.randomBytes(3).toString('hex');
    return `${suffix}-${generateSlug(title)}`;
}

// PostsController handles all operations related to blog posts, including creating, retrieving, and updating posts.
export class PostsController {

    // Only authenticated users can create posts
    static async create(req, res, next) {
        try {
            // Extract post data from the request body
            const { title, tags, content } = req.body;
            const userid = req.user.id;

            // Generate a unique slug for the post
            const slug = generateUniqueSlug(title);
            const tagsArray = Array.isArray(tags) ? tags : [tags];

            // Create the post in the database
            const post = await PostModel.create(title, slug, tagsArray, content, userid);

            // Return the created post
            res.status(201).json({
                success: true,
                message: 'Post created successfully',
                data: { post }
            });
        } catch (error) {
            next(error);
        }
    }

    // Anyone can view the list of posts, but only basic info (id, title, slug, tags) is returned
    static async getAll(req, res, next) {
        try {
            // Fetch all posts but only return id, title, slug, and tags for each post
            const posts = await PostModel.findAll();
            res.status(200).json({
                success: true,
                data: { posts }
            });
        } catch (error) {
            next(error);
        }
    }

    // Anyone can view a post, but non-subscribers only get a teaser
    static async getOneByHex(req, res, next) {
        try {
            // Validate hex format
            const { hex } = req.params;

            // Hex should be exactly 6 characters long and contain only lowercase letters and digits
            if (!/^[a-f0-9]{6}$/.test(hex)) {
                return res.status(400).json({ success: false, message: 'Invalid post identifier' });
            }

            // Find the post by hex
            const post = await PostModel.findByHex(hex);
            if (!post) {
                return res.status(404).json({ success: false, message: 'Post not found' });
            }

            // Determine access level
            const isAuthor = req.user?.id === post.userid;
            const isSubscriber = req.user?.is_subscribed === true;
            const hasFullAccess = isAuthor || isSubscriber;

            // If the user doesn't have full access, return only a teaser (first paragraph)
            if (!hasFullAccess) {
                const teaser = post.content.split(/\n+/).find(p => p.trim()) || '';
                post.content = teaser;
            }

            // Return the post with access level information
            res.status(200).json({
                success: true,
                data: { post, access: hasFullAccess ? 'full' : 'teaser' }
            });
        } catch (error) {
            next(error);
        }
    }

    // Only the author can update their post
    static async update(req, res, next) {
        try {
            // Validate hex format
            const { hex } = req.params;

            // Hex should be exactly 6 characters long and contain only lowercase letters and digits
            if (!/^[a-f0-9]{6}$/.test(hex)) {
                return res.status(400).json({ success: false, message: 'Invalid post identifier' });
            }

            // Find the post by hex
            const post = await PostModel.findByHex(hex);
            if (!post) {
                return res.status(404).json({ success: false, message: 'Post not found' });
            }

            // Check if the authenticated user is the author of the post
            if (post.userid !== req.user.id) {
                return res.status(403).json({ success: false, message: 'Forbidden' });
            }

            // Extract updated fields from the request body
            const { title, tags, content } = req.body;
            const tagsArray = Array.isArray(tags) ? tags : [tags];

            // Update the post
            const updated = await PostModel.update(post.id, title, tagsArray, content);
            
            // Return the updated post
            res.status(200).json({ success: true, data: { post: updated } });
        } catch (error) {
            next(error);
        }
    }
}

export default PostsController;
