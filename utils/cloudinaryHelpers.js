import { v2 as cloudinary } from "cloudinary";

export const uploadImage = async (image,folder) => {
  const result = await cloudinary.uploader.upload(image.tempFilePath, {
    folder: `hooked/${folder}`,
  });
  return result;
};

export const deleteAssetsFromServer = async (assets) => {
  try{
    const assetPublicIds = assets.map(({publicId}) => publicId);
    const res = await cloudinary.api.delete_resources(assetPublicIds, (result, error)=>{
      if(!error){
        return result
      }
      return error
    })
    return res
  }
  catch(err){
    return err;
  }
}