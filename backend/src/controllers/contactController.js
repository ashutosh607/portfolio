import Contact from '../models/Contact.js';

export const getContact = async (req, res, next) => {
  try {
    let contact = await Contact.findOne();
    if (!contact) {
      contact = await Contact.create({});
    }

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
    let contact = await Contact.findOne();
    if (!contact) {
      contact = await Contact.create(req.body);
    } else {
      contact = await Contact.findByIdAndUpdate(contact._id, req.body, {
        new: true,
        runValidators: true,
      });
    }

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

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and message.',
      });
    }

    let contact = await Contact.findOne();
    if (!contact) {
      contact = await Contact.create({});
    }

    contact.messages.unshift({
      name,
      email,
      subject: subject || 'Shinobi Inquiry',
      message,
    });

    await contact.save();

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

