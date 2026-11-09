import Contact from '../models/Contact.js';

export const getContact = async (req, res, next) => {
  try {
    const contact = await Contact.findOne() || new Contact();

    // If non-admin public request, hide messages
    const isPublic = req.query.includeMessages !== 'true';
    const responseData = contact.toObject();
    if (isPublic) {
      delete responseData.messages;
    }

    res.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    next(error);
  }
};

export const updateContact = async (req, res, next) => {
  try {
    const settings = Object.fromEntries(Object.entries(req.body).filter(([key]) =>
      ['email','githubUrl','linkedinUrl','location','availabilityText','isAvailable','resume','description'].includes(key)));
    const contact = await Contact.findOneAndUpdate({}, {$set:settings,$setOnInsert:{_id:'000000000000000000000001'}},
      {new:true,upsert:true,runValidators:true});
    res.json({
      success: true,
      message: 'Contact details updated successfully',
      data: contact,
    });
  } catch (error) {
    next(error);
  }
};

export const submitVisitorMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    if (typeof name!=='string' || !name.trim() || name.length>100 || typeof email!=='string' || email.length>200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || typeof message!=='string' || !message.trim() || message.length>5000 || (subject!=null && (typeof subject!=='string'||subject.length>200))) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and message.',
      });
    }

    await Contact.updateOne({},{$setOnInsert:{_id:'000000000000000000000001'},
      $push:{messages:{$each:[{name,email,subject:subject || 'Portfolio inquiry',message}],$position:0}}},{upsert:true,runValidators:true});
    res.status(201).json({
      success: true,
      message: 'Your scroll message has reached the Hokage Monument!',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteVisitorMessage = async (req, res, next) => {
  try {
    const result = await Contact.updateOne({'messages._id': req.params.messageId}, {$pull: {messages: {_id: req.params.messageId}}});
    if (!result.matchedCount) return res.status(404).json({message: 'Message not found'});
    res.json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

