import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    try {
        // Get the channel ID from the request parameters or JWT token
        const channelId = req.user.channelId; // Assuming the channel ID is stored in the user object obtained from JWT token

        // Query the database to get channel statistics
        const totalVideoViews = await Video.aggregate([{ $match: { channel: channelId } }, { $group: { _id: null, totalViews: { $sum: "$views" } } }]);
        const totalSubscribers = await Subscription.countDocuments({ channel: channelId });
        const totalVideos = await Video.countDocuments({ channel: channelId });
        // Add more queries as needed for additional statistics (e.g., total likes)
        const totalLikes = await Like.aggregate([
            { $lookup: { from: "videos", localField: "video", foreignField: "_id", as: "videoInfo" } }, // Lookup video information
            { $unwind: "$videoInfo" }, // Unwind the array created by the lookup
            { $group: { _id: "$videoInfo.channel", totalLikes: { $sum: 1 } } } // Group by video's channel and count total likes
        ]);
        

        // Construct the response object with channel statistics
        const channelStats = {
            totalVideoViews: totalVideoViews[0]?.totalViews || 0,
            totalSubscribers,
            totalVideos,
            // Add more statistics as needed
        };

        // Send the response using ApiResponse
        const response = new ApiResponse({ data: channelStats });
        res.status(200).json(response);
    } catch (error) {
        console.error("Error getting channel stats:", error);
        // Send error response using ApiError
        const apiError = new ApiError(500, "Internal Server Error");
        res.status(apiError.statusCode).json(apiError);
    }
});

const getChannelVideos = asyncHandler(async (req, res) => {
    try {
        // Get the channel ID from the request parameters or JWT token
        const channelId = req.user.channelId;

        // Query the database to find all videos uploaded by the channel
        const videos = await Video.find({ channel: channelId }).exec();

        // Construct and send the response
        const response = new ApiResponse({ videos });
        res.status(200).json(response);
    } catch (error) {
        // Handle errors
        console.error(error);
        const apiError = new ApiError(500, "Internal Server Error");
        res.status(apiError.statusCode).json(apiError);
    }
});


export {
    getChannelStats, 
    getChannelVideos
    }