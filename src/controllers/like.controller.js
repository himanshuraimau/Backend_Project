import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Tweet } from "../models/tweet.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id; // Assuming userId is available in the request

    try {
        // Check if the user has already liked the video
        const existingLike = await Like.findOne({ video: videoId, likedBy: userId });

        if (existingLike) {
            // If the user has already liked the video, remove the like
            await existingLike.remove();
            res.status(200).json({ message: "Like removed successfully" });
        } else {
            // If the user has not liked the video, add a like
            const newLike = new Like({ video: videoId, likedBy: userId });
            await newLike.save();
            res.status(200).json({ message: "Like added successfully" });
        }
    } catch (error) {
        // Handle errors
        console.error(error);
        const apiError = new ApiError(500, "Internal Server Error");
        res.status(apiError.statusCode).json(apiError);
    }
});


const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
const userId = req.user._id; // Assuming userId is available in the request

try {
    // Check if the user has already liked the comment
    const existingCommentLike = await Like.findOne({ comment: commentId, likedBy: userId });

    if (existingCommentLike) {
        // If the user has already liked the comment, remove the like
        await existingCommentLike.remove();
        res.status(200).json({ message: "Like removed successfully" });
    } else {
        // If the user has not liked the comment, add a like
        const newLike = new Like({ comment: commentId, likedBy: userId });
        await newLike.save();
        res.status(200).json({ message: "Like added successfully" });
    }
} catch (error) {
    // Handle errors
    console.error(error);
    const apiError = new ApiError(500, "Internal Server Error");
    res.status(apiError.statusCode).json(apiError);
}


})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
const userId = req.user._id; // Assuming userId is available in the request

try {
    // Check if the user has already liked the tweet
    const existingTweetLike = await Like.findOne({ tweet: tweetId, likedBy: userId });

    if (existingTweetLike) {
        // If the user has already liked the tweet, remove the like
        await existingTweetLike.remove();
        res.status(200).json({ message: "Like removed successfully" });
    } else {
        // If the user has not liked the tweet, add a like
        const newLike = new Like({ tweet: tweetId, likedBy: userId });
        await newLike.save();
        res.status(200).json({ message: "Like added successfully" });
    }
} catch (error) {
    // Handle errors
    console.error(error);
    const apiError = new ApiError(500, "Internal Server Error");
    res.status(apiError.statusCode).json(apiError);
}

}
)
const getLikedVideos = asyncHandler(async (req, res) => {
    try {
        // Assuming userId is available in the request
        const userId = req.user._id;

        // Find all likes by the user
        const userLikes = await Like.find({ likedBy: userId });

        // Extract video ids from the likes
        const videoIds = userLikes.map(like => like.video);

        // Find the details of the liked videos
        const likedVideos = await Video.find({ _id: { $in: videoIds } });

        // Send the response
        res.status(200).json({ likedVideos });
    } catch (error) {
        // Handle errors
        console.error(error);
        const apiError = new ApiError(500, "Internal Server Error");
        res.status(apiError.statusCode).json(apiError);
    }
});


export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}