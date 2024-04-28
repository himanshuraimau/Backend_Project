import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    // Validate request body
    if (!name || !description) {
        throw new ApiError(400, "Name and description are required for creating a playlist");
    }

    // Create playlist
    const playlist = new Playlist({
        name,
        description,
        // You can add additional fields if needed
    });

    // Save playlist to the database
    await playlist.save();

    // Construct response object
    const response = new ApiResponse({ playlist });

    // Send response
    res.status(201).json(response);
});


const getUserPlaylists = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.params;

        // Query the database to find playlists associated with the user
        const playlists = await Playlist.find({ owner: userId }).exec();

        // Construct and send the response
        const response = new ApiResponse({ playlists });
        res.status(200).json(response);
    } catch (error) {
        // Handle errors
        console.error(error);
        const apiError = new ApiError(500, "Internal Server Error");
        res.status(apiError.statusCode).json(apiError);
    }
});


const getPlaylistById = asyncHandler(async (req, res) => {
    try {
        const { playlistId } = req.params;

        // Find the playlist by its ID
        const playlist = await Playlist.findById(playlistId).exec();

        if (!playlist) {
            // If playlist is not found, return a 404 Not Found error
            const apiError = new ApiError(404, "Playlist not found");
            return res.status(apiError.statusCode).json(apiError);
        }

        // Construct and send the response
        const response = new ApiResponse({ playlist });
        res.status(200).json(response);
    } catch (error) {
        // Handle errors
        console.error(error);
        const apiError = new ApiError(500, "Internal Server Error");
        res.status(apiError.statusCode).json(apiError);
    }
});


const addVideoToPlaylist = asyncHandler(async (req, res) => {
    try {
        const { playlistId, videoId } = req.params;

        // Find the playlist by its ID
        const playlist = await Playlist.findById(playlistId).exec();

        if (!playlist) {
            // If playlist is not found, return a 404 Not Found error
            const apiError = new ApiError(404, "Playlist not found");
            return res.status(apiError.statusCode).json(apiError);
        }

        // Update the playlist to add the video ID to the list of videos
        playlist.videos.push(videoId);
        await playlist.save();

        // Construct and send the response
        const response = new ApiResponse({ message: "Video added to playlist successfully" });
        res.status(200).json(response);
    } catch (error) {
        // Handle errors
        console.error(error);
        const apiError = new ApiError(500, "Internal Server Error");
        res.status(apiError.statusCode).json(apiError);
    }
});


const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    try {
        const { playlistId, videoId } = req.params;

        // Find the playlist by its ID
        const playlist = await Playlist.findById(playlistId).exec();

        if (!playlist) {
            // If playlist is not found, return a 404 Not Found error
            const apiError = new ApiError(404, "Playlist not found");
            return res.status(apiError.statusCode).json(apiError);
        }

        // Remove the specified video ID from the playlist's videos array
        playlist.videos = playlist.videos.filter(id => id !== videoId);
        await playlist.save();

        // Construct and send the response
        const response = new ApiResponse({ message: "Video removed from the playlist successfully" });
        res.status(200).json(response);
    } catch (error) {
        // Handle errors
        console.error(error);
        const apiError = new ApiError(500, "Internal Server Error");
        res.status(apiError.statusCode).json(apiError);
    }
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    try {
        // Find the playlist by its ID and delete it
        const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

        if (!deletedPlaylist) {
            // If playlist is not found, return a 404 Not Found error
            const apiError = new ApiError(404, "Playlist not found");
            return res.status(apiError.statusCode).json(apiError);
        }

        // Construct and send the response
        const response = new ApiResponse({ message: "Playlist deleted successfully" });
        res.status(200).json(response);
    } catch (error) {
        // Handle errors
        console.error(error);
        const apiError = new ApiError(500, "Internal Server Error");
        res.status(apiError.statusCode).json(apiError);
    }
});


const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    try {
        // Find the playlist by its ID
        let playlist = await Playlist.findById(playlistId).exec();

        if (!playlist) {
            // If playlist is not found, return a 404 Not Found error
            const apiError = new ApiError(404, "Playlist not found");
            return res.status(apiError.statusCode).json(apiError);
        }

        // Update the playlist's name and description fields with the new values
        playlist.name = name;
        playlist.description = description;

        // Save the updated playlist document
        playlist = await playlist.save();

        // Construct and send the response
        const response = new ApiResponse({ playlist });
        res.status(200).json(response);
    } catch (error) {
        // Handle errors
        console.error(error);
        const apiError = new ApiError(500, "Internal Server Error");
        res.status(apiError.statusCode).json(apiError);
    }
});


export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}