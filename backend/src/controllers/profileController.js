import Profile from '../models/Profile.js';

export async function getProfile(req,res) {
  const profile=await Profile.findOne().select(req.user?'+draft':'-draft');
  res.json({data:profile || new Profile()});
}

export async function updateProfile(req,res) {
  const {hero,about,githubCalendar}=req.body;
  if(!hero && !about && !githubCalendar)return res.status(400).json({message:'Provide profile content.'});
  const fields={...(hero && {hero}),...(about && {about}),...(githubCalendar && {githubCalendar})};
  const update=req.body.saveDraft ? {$set:{draft:fields}} : {$set:fields,$unset:{draft:1}};
  update.$setOnInsert={_id:'000000000000000000000002'};
  const profile=await Profile.findOneAndUpdate({},update,{upsert:true,new:true,runValidators:true}).select('+draft');
  res.json({success:true,data:profile});
}
