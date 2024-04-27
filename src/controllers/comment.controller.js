import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query
    const comments = await Comment.find({videoId})
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec()
    const count = await Comment.count({ videoId })
    const response = new ApiResponse({comments, page, count})
    res.status(200).json(response)



})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId} = req.params
    const {content} = req.body
    const comment = new Comment({videoId, content})
    await comment.save()
    const response = new ApiResponse({comment})
    res.status(201).json(response)



})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId} = req.params
   
    const comment = await Comment.findById(commentId);
    if(!comment){
        return res.status(404).json({ error: 'Comment not found' });
    }
    const {content} = req.body
    comment.content = content
    await comment.save();
    const response = new ApiResponse({ comment });
    res.status(200).json(response);
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId}  = req.params
    const comment = await Comment.findById(commentId)
    if(!comment){
        return res.status(404).json({ error: 'Comment not found' });
    }
    await comment.delete()
    
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }