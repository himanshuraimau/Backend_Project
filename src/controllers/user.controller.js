import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js"
import { User} from "../models/user.model.js"
import uploadOnCloudinary from "../utils/cloudinary.js"
import  ApiResponse  from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = asyncHandler( async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const {fullName, email, username, password } = req.body
    console.log("email: ", email);

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    

    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

   let coverImageLocalPath;
   if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
      coverImageLocalPath = req.files.coverImage[0].path
    }
    

   if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

   if (!avatar) {
      throw new ApiError(400, "Avatar file is required")
    }
   

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

} )

const loginUser = asyncHandler( async (req, res) => {
                     // req-> email, password
                     // find user by email
                     // check if user exists
                     // check if password is correct
                     // generate token
                     // save token in db
                     // return token by cookie

               const { email,username, password } = req.body;
                console.log("email: ", email);
                
            if(!(username || email)){
                throw new ApiError(400, "Username or email are required")
            }
            
          const user =  await User.findOne({$or: [{email}, {username}]});
          if(!user){
              throw new ApiError(404, "User not found")
          }

          const isPasswordVaild =  await user.isPasswordCorrect(password);
           
          if(!isPasswordVaild){
              throw new ApiError(400, "Invalid password")
          }
         
        const {accessToken,refreshToken} = await generateAccessAndRefereshTokens(user._id)
        
        const loggedUser = await User.findById(user._id).select("-password -refreshToken");

       const options = {
          httpOnly: true,
          secure: true
       }
        return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200,
                {
                    user: loggedUser,
                    accessToken,
                    refreshToken
                }, 
                 "User logged in successfully")
        )
         
});

const logoutUser = asyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async(req, res) => {
   const incomingRefreshToken =  req.cookies.refreshToken || req.body.refreshToken
   if(!incomingRefreshToken){
       throw new ApiError(401, "Unauthorized request")

   }
    try {
        jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET, async(err, decoded) => {
            if(err){
                throw new ApiError(401, "Invalid refresh token")
            }
    
            const user = await User.findById(decoded._id );
        })
        if(!user){
            throw new ApiError(401, "Invalid refresh token")
        }
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Invalid refresh token")
        }
    
        const options ={
            httpOnly: true,
            secure: true
        
        }
       const {accessToken,newrefreshToken}= await generateAccessAndRefereshTokens(user._id)
        
        return res
        .status(200)
        .cookie("accessToken",accessToken, options)
        .cookie("refreshToken", newrefreshToken, options)
        .json(new ApiResponse(200, {accessToken, newrefreshToken}))
    }
    
     catch (error) {
        throw new ApiError(401, "Invalid refresh token")
    }})
const changeCurrentPassword = asyncHandler(async(req,res) =>{
    const { oldPassword , newPassword} = req.body;
    
    const user = User.findById(req.user?._id);
    const isPasswordCorrect =  await user.isPasswordCorrect(oldPassword);
    if(!isPasswordCorrect){
        throw new ApiError(400, "Invalid old password")
    }
    user.password = newPassword;
    await user.save({validateBeforeSave:false});
    
    return res
    .status(200)
    .json(new Response(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler(async(req,res) =>{
    return res.status(200)
    .json(new ApiResponse(200, req.user, "User data retrieved successfully"))
})
const updateAccountDetails = asyncHandler(async(req,res) =>{
    const {fullName, email, username} = req.body;

    if(!fullName || !email){
        throw new ApiError(400, "Fullname and email are required")  
    }
    const user= User.findByIdAndUpdate(req.user?._id,{
       $set:{
        fullName,
        email,
        username
       }
    },
    {
        new: true
    }
    ).select("-password ")
    
    return res
    .status(200)
    .json(new ApiResponse(200, user, "User data updated successfully"))
    })

const updateUserAvatar = asyncHandler(async(req,res) =>{
    const avatarLocalPath = req.file?.path;
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }
     
    //TODO: DELETE OLD AVATAR FROM CLOUDINARY


    const avatar = await uploadOnCloudinary(avatarLocalPath);
    
    if(!avatar.url){
        throw new ApiError(500, "Something went wrong while uploading avatar")
    }
    
    const user = await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            avatar: avatar.url
        }
    },
    {
        new: true
    }
    ).select("-password");

    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar updated successfully")
    
    
    )

})
const updateUserCoverImage = asyncHandler(async(req,res) =>{
    const coverImageLocalPath = req.file?.path;
    if(!coverImageLocalPath){
        throw new ApiError(400, "CoverImage file is required")
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    
    if(!coverImage.url){
        throw new ApiError(500, "Something went wrong while uploading CoverImage")
    }
    
    const user = await User.findByIdAndUpdate(req.user?._id,{
        $set:{
            coverImage: coverImage.url
        }
    },
    {
        new: true
    }
    ).select("-password");
    
    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "CoverImage updated successfully")
    
    )
})

const userChannelProfile = asyncHandler(async(req,res) =>{
    const { username } = req.params;
    
    if(!username.trim()){
        throw new ApiError(400, "Username is required")
    }

    const channel = await User.aggregate([{
             $match:{
                    username: username?.tolowerCase()
                
             }
    },{
        $lookup:{
            from: "subscriptions",
            localField: "_id",
            foreignField: "Channel",
            as: "subscribers"
        }
    },{
        $lookup:{
            from: "subscriptions",
            localField: "_id",
            foreignField: "subscriber",
            as: "subscribedTo"
        }

    },{
        $addFields:{
            subscriberCount: {$size: "$subscribers"},
            subscribedToCount: {$size: "$subscribedTo"},
            isSubscribed: {
                $cond:{
                    if: {
                        $in: [req.user?._id, "$subscribers.subscriber"]
                    },
                    then: true,
                    else: false
                
            }}
        
    }},{
        $project:{
                 fullName:1,
                 username:1,
                 subscribersCount:1,
                 subscribedToCount:1,
                 isSubscribed:1,
                 avatar:1,
                 email:1,
                 coverImage:1,


    }}])
    if(!channel?.length){
        throw new ApiError(404, "Channel does not found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channel[0], "Channel data retrieved successfully")
    )
})

export {
    registerUser,
     loginUser,
     logoutUser,
     refreshAccessToken,
     changeCurrentPassword,
     getCurrentUser,
     updateAccountDetails,
     updateUserAvatar,
     updateUserCoverImage,
     userChannelProfile
    };