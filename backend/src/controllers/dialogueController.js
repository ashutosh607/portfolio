import Dialogue from '../models/Dialogue.js';

export const getDialogues = async (req, res, next) => {
  try {
    const isPublic = !req.user || req.query.all !== 'true';
    const filter = isPublic ? { visible: true } : {};
    const dialogues = await Dialogue.find(filter);

    res.json({
      success: true,
      count: dialogues.length,
      data: dialogues,
    });
  } catch (error) {
    next(error);
  }
};

export const getDialogueByCharacter = async (req, res, next) => {
  try {
    const isPublic = !req.user;
    const filter = {
      characterId: req.params.characterId,
      ...(isPublic ? { visible: true } : {}),
    };
    const dialogue = await Dialogue.findOne(filter);
    if (!dialogue) {
      return res.status(404).json({ success: false, message: 'Character dialogue not found' });
    }
    res.json({ success: true, data: dialogue });
  } catch (error) {
    next(error);
  }
};

export const updateDialogue = async (req, res, next) => {
  try {
    if (req.body.visible !== false && Array.isArray(req.body.dialogueSequence) && !req.body.dialogueSequence.length) {
      return res.status(400).json({ message: 'A published conversation requires a line.' });
    }
    const dialogue = await Dialogue.findOneAndUpdate(
      { characterId: req.params.characterId },
      req.body,
      { new: true, upsert: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Dialogue tree updated successfully',
      data: dialogue,
    });
  } catch (error) {
    next(error);
  }
};
