import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    try {
        // Extract content and userId from request body and JWT payload
        const { content } = req.body;
        const userId = req.user._id; // Assuming req.user contains the authenticated user object
        
        // Check if content exists
        if (!content) {
            throw new ApiError(400, "Tweet content is required");
        }

        // Find the user in the database
        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        // Create the tweet
        const tweet = new Tweet({ content, user: userId });
        await tweet.save();

        // Respond with the created tweet
        const response = new ApiResponse({ tweet });
        res.status(201).json(response);
    } catch (error) {
        console.error(error);
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({ message: error.message });
        } else {
            res.status(500).json({ error: "Internal Server Error" });
        }
    }
});

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    // Extract the userId from the authenticated user object
    const userId = req.user._id;

    // Fetch tweets associated with the authenticated userId
    const tweets = await Tweet.find({ user: userId });

    // Respond with the tweets
    const response = new ApiResponse({ tweets });
    res.status(200).json(response);
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
       // Extract tweetId and new content from the request
       const { tweetId } = req.params; // Assuming tweetId is included in the route params
       const { content } = req.body;

       // Find the tweet by its ID
       const tweet = await Tweet.findById(tweetId);

       // Check if the tweet exists
       if (!tweet) {
           throw new ApiError(404, "Tweet not found");
       }

       // Verify ownership of the tweet using the authenticated user's ID
       if (tweet.user.toString() !== req.user._id.toString()) {
           throw new ApiError(403, "You are not authorized to update this tweet");
       }

       // Update the tweet content
       tweet.content = content;

       // Save the updated tweet
       await tweet.save();

       // Respond with the updated tweet
       const response = new ApiResponse({ tweet });
       res.status(200).json(response);

})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
     // Extract userId and new content from the request
     const userId = req.user._id;
     const { tweetId } = req.params; // Assuming tweetId is included in the route params
     const tweet = await Tweet.findById(tweetId);
     
       // Check if the tweet exists
       if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }
      // Delete the tweet
      await tweet.remove();

      // Respond with a success message
      res.status(200).json({ message: "Tweet deleted successfully" });


})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}