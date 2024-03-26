import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';          



cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const  uploadToCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        //upload the file to cloydinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type: "auto"
        })
        //file has been uploaded
        console.log("File uploaded to cloudinary",response.url);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath); //removes the temp save file from the server
        return null;
    }
    
}

export {uploadToCloudinary};