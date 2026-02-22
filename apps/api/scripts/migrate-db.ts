import { MongoClient, ObjectId } from 'mongodb';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function migrate() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error("MONGODB_URI is required");

  // Add the legacy schema database name explicitly if missing
  const client = new MongoClient(mongoUri);
  await client.connect();
  const db = client.db('notify_dev'); // Replace with generic parsing if varied

  console.log("Connected to MongoDB");

  // 1. Migrate Users
  const users = await db.collection('users').find().toArray();
  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user._id.toString() },
      update: {}, // Don't overwrite if re-run
      create: {
        id: user._id.toString(),
        username: user.username,
        email: user.email,
        password: user.password,
        avatar: user.avatar,
        createdAt: user.createdAt || new Date(),
        updatedAt: user.updatedAt || new Date(),
        deletedAt: user.deletedAt,
        llmProviders: user.llmProviders || {},
        defaultModel: user.defaultModel,
      }
    });
  }
  console.log(`Migrated ${users.length} users.`);

  // 2. Migrate AIProfiles
  const profiles = await db.collection('aiprofiles').find().toArray();
  for (const p of profiles) {
    await prisma.aIProfile.upsert({
      where: { id: p._id.toString() },
      update: {},
      create: {
        id: p._id.toString(),
        userId: p.userId.toString(),
        name: p.name,
        systemPrompt: p.systemPrompt,
        avatarUrl: p.avatarUrl,
        voiceSettings: p.voiceSettings || {},
        model: p.model,
        createdAt: p.createdAt || new Date(),
        updatedAt: p.updatedAt || new Date(),
      }
    });
  }
  console.log(`Migrated ${profiles.length} AI profiles.`);

  // 3. Migrate Conversations
  const convos = await db.collection('conversations').find().toArray();
  for (const c of convos) {
    await prisma.conversation.upsert({
      where: { id: c._id.toString() },
      update: {},
      create: {
        id: c._id.toString(),
        name: c.name,
        avatar: c.avatar,
        ownerId: c.ownerId.toString(),
        type: c.type || "GROUP",
        createdAt: c.createdAt || new Date(),
        updatedAt: c.updatedAt || new Date(),
        deletedAt: c.deletedAt,
        isAiAgent: c.isAiAgent ?? true,
        systemPrompt: c.systemPrompt || "You are a helpful AI assistant.",
        aiModel: c.aiModel || "gpt-4o-mini",
        aiProfileId: c.aiProfileId?.toString(),
        totalTokensUsed: c.totalTokensUsed || 0,
        maxContextWindow: c.maxContextWindow || 8000,
      }
    });
  }
  console.log(`Migrated ${convos.length} conversations.`);

  // 4. Migrate Messages
  const messages = await db.collection('messages').find().toArray();
  for (const m of messages) {
    await prisma.message.upsert({
      where: { id: m._id.toString() },
      update: {},
      create: {
        id: m._id.toString(),
        senderId: m.senderId.toString(),
        conversationId: m.conversationId?.toString(),
        text: m.text,
        url: m.url,
        fileName: m.fileName,
        createdAt: m.createdAt || new Date(),
        updatedAt: m.updatedAt || new Date(),
        deletedAt: m.deletedAt,
        tokenCount: m.tokenCount || 0,
        isArchived: m.isArchived || false,
      }
    });
  }
  console.log(`Migrated ${messages.length} messages.`);

  console.log("Migration Complete!");
  await client.close();
  await prisma.$disconnect();
}

migrate().catch(e => {
  console.error(e);
  process.exit(1);
});
