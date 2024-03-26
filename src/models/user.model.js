import mongoose,{Schema} from "mongoose";
import Jwt from "jsonwebtoken";
import bcrypt from "bcrypt";



const userSchema = new Schema(
    {
           username: {
                type: String,
                required: true,
                unique: true,
                lowercase: true,
                trim: true,
                index: true,
              },
              email:{
                type: String,
                required: true,
                unique: true,
                lowercase: true,
                trim: true,
                
              },
              fullName:{
                type: String,
                required: true,
                trim: true,
                index: true  
            },
            avtar:{
                type: String,
                required:true
            },
            coverImage:{
                type: String,
            },
            watchHistory:{
                type: Schema.Types.ObjectId,
                ref: "Video"
            },
            password:{
                type:String,
                required:[true,"Password is required"],
            },
            refreshToken:{
                type:String
            }
        
            },
            {
                timestamps:true
            }
);
userSchema.pre("save",async function(next){
    if(!this.isModified("password")){
        next();
    }
    try{
        this.password = await bcrypt.hash(this.password,10);
        next();
    }catch(err){
        next(err);
    }
});

userSchema.methods.isPasswordMatch = async function(password){
    return await bcrypt.compare(password,this.password);
}

userSchema.methods.generateAccessToken = function(){
    return Jwt.sign(
        {
            _id:this.id,
            email:this.email,
            username:this.username,
            fullName:this.fullName
        },
        process.env.ACCESS.TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }

    )
}
uerSchema.methods.generateRefreshToken = function(){
    return Jwt.sign(
        {
            _id:this.id,
            
        },
        process.env.REFRESH.TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }

    )
}
export const User = mongoose.model("User",userSchema)