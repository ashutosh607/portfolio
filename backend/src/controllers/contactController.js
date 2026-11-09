import Contact from '../models/Contact.js';

export const getContact = async (req, res, next) => {
  try {
    const contact = (await Contact.findOne()) || new Contact();
    const responseData = contact.toObject();

    // SECURITY: Messages are strictly private; only returned if authenticated admin AND explicitly requested via includeMessages=true
    if (!req.user || req.query.includeMessages !== 'true') {
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

export const getContactMessages = async (req, res, next) => {
  try {
    const contact = await Contact.findOne();
    res.json({
      success: true,
      data: contact?.messages || [],
    });
  } catch (error) {
    next(error);
  }
};

export const updateContact = async (req, res, next) => {
  try {
    const settings = Object.fromEntries(
      Object.entries(req.body).filter(([key]) =>
        [
          'email',
          'githubUrl',
          'linkedinUrl',
          'location',
          'availabilityText',
          'isAvailable',
          'resume',
          'description',
        ].includes(key)
      )
    );

    const contact = await Contact.findOneAndUpdate(
      {},
      { $set: settings, $setOnInsert: { _id: '000000000000000000000001' } },
      { new: true, upsert: true, runValidators: true }
    );

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

    await Contact.updateOne(
      {},
      {
        $setOnInsert: { _id: '000000000000000000000001' },
        $push: {
          messages: {
            $each: [
              {
                name: name.trim(),
                email: email.trim().toLowerCase(),
                subject: (subject || 'Shinobi Inquiry').trim(),
                message: message.trim(),
              },
            ],
            $position: 0,
            $slice: 100, // Cap stored messages to prevent storage exhaustion
          },
        },
      },
      { upsert: true }
    );

    res.status(201).json({
      success: true,
      message: 'Your scroll message has reached the Hokage Monument!',
    });
  } catch (error) {
    next(error);
  }
};

export const updateVisitorMessageStatus = async (req, res, next) => {
  try {
    const { read } = req.body;
    const contact = await Contact.findOneAndUpdate(
      { 'messages._id': req.params.messageId },
      { $set: { 'messages.$.read': Boolean(read) } },
      { new: true }
    );
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    res.json({ success: true, message: 'Message status updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const deleteVisitorMessage = async (req, res, next) => {
  try {
    const contact = await Contact.findOne();
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact document not found' });
    }

    contact.messages = contact.messages.filter(
      (m) => m._id.toString() !== req.params.messageId
    );
    await contact.save();

    res.json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
