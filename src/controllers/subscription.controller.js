import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
     // Extract channelId from the request parameters
     const { channelId } = req.params;

     // Extract the authenticated user's ID from req.user
     const userId = req.user._id;

     // Check if the user is already subscribed to the channel
     const existingSubscription = await Subscription.findOne({
         subscriber: userId,
         channel: channelId
     });

     // Toggle the subscription status
     if (existingSubscription) {
         // If the subscription exists, unsubscribe
         await existingSubscription.remove();
         res.status(200).json({ subscribed: false });
     } else {
         // If the subscription doesn't exist, subscribe
         const newSubscription = new Subscription({
             subscriber: userId,
             channel: channelId
         });
         await newSubscription.save();
         res.status(200).json({ subscribed: true });
     }
}) 

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    try {
        // Find all subscriptions where the channel's ID matches channelId
        const subscriptions = await Subscription.find({ channel: channelId });

        // Extract the subscriber IDs from the subscriptions
        const subscriberIds = subscriptions.map(subscription => subscription.subscriber);

        // You may want to fetch the user details based on subscriberIds
        // For example:
        // const users = await User.find({ _id: { $in: subscriberIds } });

        // Construct and send the response
        const response = new ApiResponse({ subscriptions });
        res.status(200).json(response);
    } catch (error) {
        // Handle errors
        console.error(error);
        const apiError = new ApiError(500, "Internal Server Error");
        res.status(apiError.statusCode).json(apiError);
    }
});


const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    try {
        // Find all subscriptions where the subscriber's ID matches subscriberId
        const subscriptions = await Subscription.find({ subscriber: subscriberId });

        // Extract the channel IDs from the subscriptions
        const channelIds = subscriptions.map(subscription => subscription.channel);


        // Construct and send the response
        const response = new ApiResponse({ subscriptions });
        res.status(200).json(response);
    } catch (error) {
        // Handle errors
        console.error(error);
        const apiError = new ApiError(500, "Internal Server Error");
        res.status(apiError.statusCode).json(apiError);
    }
});


export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}