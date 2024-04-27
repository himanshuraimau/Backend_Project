import Video from "../models/video.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

const getAllVideos = asyncHandler(async (req, res) => {
    let { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    // Parse query parameters
    page = parseInt(page);
    limit = parseInt(limit);

    // Construct initial query object
    let videoQuery = {};

    // Handle optional query parameter
    if (query) {
        // Example: Search videos by title
        videoQuery.title = { $regex: query, $options: 'i' }; // Case-insensitive search
    }

    // Handle optional userId parameter for filtering
    if (userId) {
        videoQuery.owner = userId; // Assuming userId corresponds to the owner field in the video document
    }

    // Construct sort object
    let sort = {};
    if (sortBy && sortType) {
        sort[sortBy] = sortType === 'asc' ? 1 : -1; // 1 for ascending, -1 for descending
    } else {
        // Default sorting criteria if not provided
        sort.createdAt = -1; // Sort by createdAt in descending order
    }

    try {
        // Fetch videos based on the constructed query and sort criteria
        const videos = await Video.aggregatePaginate().find(videoQuery)
            .sort(sort)
            .limit(limit)
            .skip((page - 1) * limit)
            .exec();

        // Count total number of videos (for pagination)
        const count = await Video.countDocuments(videoQuery);

        // Construct response object with videos and pagination metadata
        const response = new ApiResponse({ videos, page, limit, count });

        // Send response
        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    try {
        // Upload video file and thumbnail to Cloudinary using your middleware
        const [videoUploadResult, thumbnailUploadResult] = await Promise.all([
            uploadOnCloudinary(req.files.videoFile),
            uploadOnCloudinary(req.files.thumbnail)
        ]);

        // Extract URLs of the uploaded files
        const videoUrl = videoUploadResult.secure_url;
        const thumbnailUrl = thumbnailUploadResult.secure_url;

        // Create a new video document in the database
        const newVideo = new Video({
            title,
            description,
            videoFile: videoUrl,
            thumbnail: thumbnailUrl,
            // Assuming duration, views, and isPublished are default or calculated values
        });
        await newVideo.save();

        // Send response
        res.status(201).json({ success: true, message: 'Video published successfully', data: newVideo });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    try {
        // Find the video by its ID
        const video = await Video.findById(videoId);
        
        if (!video) {
            throw new ApiError(404, "Video not found");
        }

        // Respond with the retrieved video object
        res.status(200).json({ video });
    } catch (error) {
        console.error(error);
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
});

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    try {
        // Find the video by its ID
        const video = await Video.findById(videoId);
        
        if (!video) {
            throw new ApiError(404, "Video not found");
        }

        // Example: Check if the user is authorized to update the video
        const userId = req.user._id; // Assuming req.user contains the authenticated user object
        if (userId !== video.owner.toString()) {
            throw new ApiError(403, "Unauthorized");
        }

        // Update video details based on request body
        const { title, description, thumbnail } = req.body;
        if (title) video.title = title;
        if (description) video.description = description;
        if (thumbnail) video.thumbnail = thumbnail;

        // Save the updated video document
        await video.save();

        // Respond with the updated video object
        res.status(200).json({
            message: `Video '${video.title}' updated successfully`,
            video
        });
    } catch (error) {
        console.error(error);
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    try {
        // Find the video by its ID
        const video = await Video.findById(videoId);
        
        if (!video) {
            throw new ApiError(404, "Video not found");
        }

        // Example: Check if the user is authorized to delete the video
        const userId = req.user._id; // Assuming req.user contains the authenticated user object
        if (userId !== video.owner.toString()) {
            throw new ApiError(403, "Unauthorized");
        }

        // Delete the video
        await video.delete();

        // Respond with success message
        res.status(200).json({ message: "Video deleted successfully" });
    } catch (error) {
        console.error(error);
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    try {
        // Find the video by its ID
        const video = await Video.findById(videoId);
        
        if (!video) {
            throw new ApiError(404, "Video not found");
        }

        // Example: Check if the user is authorized to toggle publish status
        const userId = req.user._id; // Assuming req.user contains the authenticated user object
        if (userId !== video.owner.toString()) {
            throw new ApiError(403, "Unauthorized");
        }

        // Toggle the publish status
        video.isPublished = !video.isPublished;

        // Save the updated video document
        await video.save();

        // Respond with the updated video object and a success message
        res.status(200).json({
            message: `Publish status of video '${video.title}' toggled successfully`,
            video
        });
    } catch (error) {
        console.error(error);
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
};
