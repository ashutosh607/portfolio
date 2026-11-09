import 'dotenv/config';
import mongoose from 'mongoose';
import Mission from '../models/Mission.js';
import Dialogue from '../models/Dialogue.js';
import { missions } from '../../../naruto-room/src/data/missions.js';
import { CHARACTERS_DATA } from '../../../naruto-room/src/config/dialogueData.js';

// Run once when adopting CMS management in an existing deployment.
await mongoose.connect(process.env.MONGO_URI);
try {
  for (const mission of missions) {
    const caseStudy = mission.caseStudy && {
      ...mission.caseStudy,
      screenshots: mission.caseStudy.screenshots.map((image) => image.url),
    };
    await Mission.updateOne(
      { slug: mission.id },
      { $setOnInsert: { ...mission, slug: mission.id, caseStudy } },
      { upsert: true, runValidators: true },
    );
  }
  for (const npc of CHARACTERS_DATA) {
    await Dialogue.updateOne(
      { characterId: npc.id },
      {
        $setOnInsert: {
          characterId: npc.id,
          name: npc.name,
          portrait: npc.portrait,
          role: npc.title,
          accent: npc.accentColor,
          choices: npc.choices,
          dialogueSequence: npc.dialogueSequence,
        },
      },
      { upsert: true, runValidators: true },
    );
  }
} finally {
  await mongoose.disconnect();
}
