import mongoose from 'mongoose';

const dialogueLineSchema = new mongoose.Schema({
  id: { type: String, required: true },
  speakerId: { type: String, required: true },
  speaker: { type: String, required: true },
  text: { type: String, required: true },
});

const choiceSchema = new mongoose.Schema({
  id: { type: String, required: true },
  text: { type: String, required: true },
  action: { type: String, default: 'close' },
  modalTarget: { type: String, default: null },
  replyDialogue: [dialogueLineSchema],
});

const dialogueSchema = new mongoose.Schema(
  {
    characterId: {
      type: String,
      required: true,
      unique: true, // sasuke, sakura, tsunade, jiraiya, orochimaru, kakashi, hinata
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: '',
    },
    accent: {
      type: String,
      default: '#e68a2e',
    },
    portrait: {
      type: String,
      default: '',
    },
    dialogueSequence: [dialogueLineSchema],
    choices: [choiceSchema],
    visible: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Dialogue = mongoose.model('Dialogue', dialogueSchema);
export default Dialogue;

