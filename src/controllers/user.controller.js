import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import {uploadOnCludinary} from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async(req,res)=>{
    // Logic to register user
    //get user details through forntend
    //validation for user--not empty
    //check if user already exists:email,username
    //check for images and avtar
    //create user object -create entry in db
    // reomove password and refresh token from response
    //check for user creation
    // return response
    const {fullname,email,password,username}=req.body;
    console.log(email);
    
    if([fullname,email,password,username].some((field)=>field.trim()==="")){

        throw new ApiError(400,"All fields are required");
    }
    User.findOne({
        $or:[
            {email:email},
            {username:username}
        ]
    },(err,user)=>{
        if(err){
            throw new ApiError(500,"Internal Server Error");
        }
        if(user){
            throw new ApiError(400,"User already exists");
        }
       
    }
    );
    const avtarLocalPath = req.files?.avatar?.path;
    const coverImageLocalPath = req.files?.coverImage?.path;

    if(!avtarLocalPath || !coverImageLocalPath){
        throw new ApiError(400,"Please provide both avatar and cover image");
    }

    await uploadOnCludinary(avtarLocalPath).then((result)=>{
        console.log(result);
    });
    
   const user =  User.create({
        fullname,
        email,
        password,
        username:username.toLowerCase(),
        avatar:avtar.url,
        coverImage:coverImage?.url || "", 
    
    });
   const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
   )
   if(!createdUser){
       throw new ApiError(500,"User not created");
   }
   return res.status(201).json(
           new ApiResponse(201,"User created successfully",createdUser)
   )

});

export {registerUser};