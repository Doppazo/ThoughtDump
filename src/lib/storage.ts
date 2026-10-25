import * as admin from "firebase-admin";
import { adminDb } from "./firebase/admin";
import { Idea, Category, RawDump, IdeaLink, BackLink } from "@/types";
import { CATEGORY_COLORS, getCategoryColor } from "./colors";

export { CATEGORY_COLORS, getCategoryColor };

const DAY = 86400000;

function createSeedData() {
  const now = Date.now();
  const ideas: Idea[] = [
    {
      id: "ex1",
      title: "Dorm laundry pickup service",
      summary: "Students hand off a bag, it comes back washed and folded the next day. Start with one dorm to test it.",
      originalText: "laundry pickup for dorms?? people hate doing laundry. also need to learn SQL at some point",
      category: "Business Ideas",
      type: "idea",
      tags: ["startup", "campus"],
      links: [],
      backlinks: [
        { ideaId: "ex6", reason: "Tests demand for the laundry idea" },
        { ideaId: "ex7", reason: "Survey action plan for this idea" },
      ],
      createdAt: now - 6 * DAY,
      updatedAt: now - 6 * DAY,
      inputType: "text",
      status: "processed",
    },
    {
      id: "ex2",
      title: "Local coffee bean subscription",
      summary: "Monthly box of beans from small Boston roasters, sold to students and young workers.",
      originalText: "Local coffee bean subscription from Boston roasters for students",
      category: "Business Ideas",
      type: "idea",
      tags: ["subscription"],
      links: [],
      backlinks: [],
      createdAt: now - 4 * DAY,
      updatedAt: now - 4 * DAY,
      inputType: "text",
      status: "processed",
    },
    {
      id: "ex3",
      title: "Set up study group for stats midterm",
      summary: "Get 3 or 4 people together the week before the midterm.",
      originalText: "stats midterm coming up, should get a study group going",
      category: "School",
      type: "task",
      tags: ["midterm"],
      links: [],
      backlinks: [],
      createdAt: now - 3 * DAY,
      updatedAt: now - 3 * DAY,
      done: false,
      inputType: "text",
      status: "processed",
    },
    {
      id: "ex4",
      title: "Learn basic SQL this month",
      summary: "Would help with the internship and with tracking numbers for any business idea.",
      originalText: "need to learn SQL at some point",
      category: "Learning",
      type: "note",
      tags: ["skills", "data"],
      links: [],
      backlinks: [],
      createdAt: now - 3 * DAY,
      updatedAt: now - 3 * DAY,
      inputType: "text",
      status: "processed",
    },
    {
      id: "ex5",
      title: "Call grandma on Sunday",
      summary: "Haven't called in two weeks.",
      originalText: "call grandma sunday",
      category: "Personal",
      type: "reminder",
      tags: ["family"],
      links: [],
      backlinks: [],
      createdAt: now - 2 * DAY,
      updatedAt: now - 2 * DAY,
      done: false,
      inputType: "text",
      status: "processed",
    },
    {
      id: "ex6",
      title: "Would students pay for laundry pickup?",
      summary: "Need to ask around before building anything. Maybe a quick survey in the dorm group chat.",
      originalText: "Would students pay for laundry pickup?",
      category: "Business Ideas",
      type: "question",
      tags: ["validation"],
      links: [{ ideaId: "ex1", reason: "Tests demand for the laundry idea", source: "ai" }],
      backlinks: [{ ideaId: "ex7", reason: "This is how you answer that question" }],
      createdAt: now - 1 * DAY,
      updatedAt: now - 1 * DAY,
      inputType: "text",
      status: "processed",
    },
    {
      id: "ex7",
      title: "Post the laundry survey in the group chat",
      summary: "Five questions max. Ask about price and how often they'd use it.",
      originalText: "Post the laundry survey in the dorm group chat",
      category: "Business Ideas",
      type: "task",
      tags: ["validation"],
      links: [
        { ideaId: "ex6", reason: "This is how you answer that question", source: "ai" },
        { ideaId: "ex1", reason: "Survey action plan for this idea", source: "ai" },
      ],
      backlinks: [],
      createdAt: now - 1 * DAY,
      updatedAt: now - 1 * DAY,
      done: false,
      inputType: "text",
      status: "processed",
    },
  ];

  const dumps: RawDump[] = [
    {
      id: "d1",
      text: "laundry pickup for dorms?? people hate doing laundry. also need to learn SQL at some point",
      createdAt: now - 6 * DAY,
      example: true,
    },
    {
      id: "d2",
      text: "call grandma sunday. stats midterm coming up, should get a study group going",
      createdAt: now - 3 * DAY,
      example: true,
    },
  ];

  const categories: Category[] = [
    { id: "cat-1", name: "Business Ideas", ideaCount: 4, color: CATEGORY_COLORS[0], createdAt: now - 6 * DAY },
    { id: "cat-2", name: "School", ideaCount: 1, color: CATEGORY_COLORS[1], createdAt: now - 3 * DAY },
    { id: "cat-3", name: "Learning", ideaCount: 1, color: CATEGORY_COLORS[2], createdAt: now - 3 * DAY },
    { id: "cat-4", name: "Personal", ideaCount: 1, color: CATEGORY_COLORS[3], createdAt: now - 2 * DAY },
  ];

  return { ideas, dumps, categories, example: true };
}

// In-memory fallback cache for development/demo
const fallbackStore: Record<
  string,
  {
    ideas: Idea[];
    dumps: RawDump[];
    categories: Category[];
    example: boolean;
  }
> = {};

function getFallbackUserStore(uid: string) {
  if (!fallbackStore[uid]) {
    fallbackStore[uid] = createSeedData();
  }
  return fallbackStore[uid];
}

export async function getUserIdeas(uid: string): Promise<Idea[]> {
  if (adminDb) {
    try {
      const snap = await adminDb
        .collection("users")
        .doc(uid)
        .collection("ideas")
        .orderBy("createdAt", "desc")
        .get();

      if (!snap.empty) {
        return snap.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            links: Array.isArray(data.links) ? data.links : [],
            backlinks: Array.isArray(data.backlinks) ? data.backlinks : [],
          } as Idea;
        });
      }
    } catch (err) {
      console.warn("Firestore getUserIdeas error, falling back:", err);
    }
  }

  const store = getFallbackUserStore(uid);
  return [...store.ideas].sort((a, b) => b.createdAt - a.createdAt);
}

export async function getUserDumps(uid: string): Promise<RawDump[]> {
  if (adminDb) {
    try {
      const snap = await adminDb
        .collection("users")
        .doc(uid)
        .collection("dumps")
        .orderBy("createdAt", "desc")
        .get();

      if (!snap.empty) {
        return snap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<RawDump, "id">),
        }));
      }
    } catch (err) {
      console.warn("Firestore getUserDumps error, falling back:", err);
    }
  }

  const store = getFallbackUserStore(uid);
  return [...store.dumps].sort((a, b) => b.createdAt - a.createdAt);
}

export async function saveUserDump(
  uid: string,
  dump: Omit<RawDump, "id">,
  customId?: string
): Promise<RawDump> {
  const id = customId || `dump_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const fullDump: RawDump = { id, ...dump };

  if (adminDb) {
    try {
      await adminDb
        .collection("users")
        .doc(uid)
        .collection("dumps")
        .doc(id)
        .set(fullDump);
    } catch (err) {
      console.warn("Firestore saveUserDump error, using fallback:", err);
    }
  }

  const store = getFallbackUserStore(uid);
  store.dumps.unshift(fullDump);
  return fullDump;
}

export async function getUserCategories(uid: string): Promise<Category[]> {
  if (adminDb) {
    try {
      const snap = await adminDb
        .collection("users")
        .doc(uid)
        .collection("categories")
        .orderBy("name", "asc")
        .get();

      if (!snap.empty) {
        return snap.docs.map((doc, idx) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name,
            ideaCount: data.ideaCount || 0,
            color: data.color || getCategoryColor(data.name, idx),
            createdAt: data.createdAt || Date.now(),
          };
        });
      }
    } catch (err) {
      console.warn("Firestore getUserCategories error, falling back:", err);
    }
  }

  const store = getFallbackUserStore(uid);
  return store.categories.map((c, idx) => ({
    ...c,
    color: c.color || getCategoryColor(c.name, idx),
  }));
}

export async function saveUserIdea(
  uid: string,
  idea: Omit<Idea, "id">,
  customId?: string
): Promise<Idea> {
  const id = customId || `idea_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const fullIdea: Idea = {
    id,
    ...idea,
    links: idea.links || [],
    backlinks: idea.backlinks || [],
  };

  if (adminDb) {
    try {
      const userRef = adminDb.collection("users").doc(uid);
      const batch = adminDb.batch();

      // Save idea
      batch.set(userRef.collection("ideas").doc(id), fullIdea);

      // Create bidirectional backlinks on target ideas
      if (fullIdea.links && fullIdea.links.length > 0) {
        for (const link of fullIdea.links) {
          const targetRef = userRef.collection("ideas").doc(link.ideaId);
          batch.update(targetRef, {
            backlinks: admin.firestore.FieldValue.arrayUnion({
              ideaId: id,
              reason: link.reason,
            }),
          });
        }
      }

      await batch.commit();
      await updateCategoryCount(uid, idea.category, 1);
      return fullIdea;
    } catch (err) {
      console.warn("Firestore saveUserIdea error, using fallback:", err);
    }
  }

  const store = getFallbackUserStore(uid);
  store.ideas.unshift(fullIdea);

  // Update bidirectional backlinks in fallbackStore
  if (fullIdea.links && fullIdea.links.length > 0) {
    for (const link of fullIdea.links) {
      const target = store.ideas.find((i) => i.id === link.ideaId);
      if (target) {
        target.backlinks = target.backlinks || [];
        if (!target.backlinks.some((b) => b.ideaId === id)) {
          target.backlinks.push({ ideaId: id, reason: link.reason });
        }
      }
    }
  }

  const cat = store.categories.find((c) => c.name.toLowerCase() === idea.category.toLowerCase());
  if (cat) {
    cat.ideaCount += 1;
  } else {
    store.categories.push({
      id: `cat_${Date.now()}`,
      name: idea.category,
      ideaCount: 1,
      color: getCategoryColor(idea.category, store.categories.length),
      createdAt: Date.now(),
    });
  }

  return fullIdea;
}

export async function updateUserIdea(
  uid: string,
  ideaId: string,
  updates: Partial<Pick<Idea, "title" | "summary" | "category" | "status" | "done" | "type" | "tags" | "links" | "backlinks">>
): Promise<Idea | null> {
  const now = Date.now();

  if (adminDb) {
    try {
      const docRef = adminDb.collection("users").doc(uid).collection("ideas").doc(ideaId);
      const snap = await docRef.get();
      if (!snap.exists) return null;

      const oldData = snap.data() as Idea;
      const updated = {
        ...oldData,
        ...updates,
        updatedAt: now,
      };

      await docRef.update({
        ...updates,
        updatedAt: now,
      });

      if (updates.category && updates.category !== oldData.category) {
        await updateCategoryCount(uid, oldData.category, -1);
        await updateCategoryCount(uid, updates.category, 1);
      }

      return updated;
    } catch (err) {
      console.warn("Firestore updateUserIdea error, using fallback:", err);
    }
  }

  const store = getFallbackUserStore(uid);
  const idx = store.ideas.findIndex((i) => i.id === ideaId);
  if (idx === -1) return null;

  const old = store.ideas[idx];
  const updated: Idea = {
    ...old,
    ...updates,
    updatedAt: now,
  };
  store.ideas[idx] = updated;

  if (updates.category && updates.category !== old.category) {
    const oldCat = store.categories.find((c) => c.name === old.category);
    if (oldCat) oldCat.ideaCount = Math.max(0, oldCat.ideaCount - 1);

    const newCat = store.categories.find((c) => c.name === updates.category);
    if (newCat) {
      newCat.ideaCount += 1;
    } else {
      store.categories.push({
        id: `cat_${Date.now()}`,
        name: updates.category,
        ideaCount: 1,
        color: getCategoryColor(updates.category, store.categories.length),
        createdAt: now,
      });
    }
  }

  return updated;
}

export async function addManualIdeaLink(
  uid: string,
  sourceIdeaId: string,
  targetIdeaId: string,
  reason: string = "Connected thought"
): Promise<{ sourceIdea: Idea; targetIdea: Idea } | null> {
  if (sourceIdeaId === targetIdeaId) return null;

  if (adminDb) {
    try {
      const userRef = adminDb.collection("users").doc(uid);
      const sourceRef = userRef.collection("ideas").doc(sourceIdeaId);
      const targetRef = userRef.collection("ideas").doc(targetIdeaId);

      const [sourceSnap, targetSnap] = await Promise.all([sourceRef.get(), targetRef.get()]);
      if (sourceSnap.exists && targetSnap.exists) {
        const sourceData = sourceSnap.data() as Idea;
        const targetData = targetSnap.data() as Idea;

        const newLinks = [...(sourceData.links || []).filter((l) => l.ideaId !== targetIdeaId), { ideaId: targetIdeaId, reason, source: "user" as const }];
        const newBacklinks = [...(targetData.backlinks || []).filter((b) => b.ideaId !== sourceIdeaId), { ideaId: sourceIdeaId, reason }];

        const batch = adminDb.batch();
        batch.update(sourceRef, { links: newLinks, updatedAt: Date.now() });
        batch.update(targetRef, { backlinks: newBacklinks, updatedAt: Date.now() });
        await batch.commit();

        return {
          sourceIdea: { ...sourceData, links: newLinks },
          targetIdea: { ...targetData, backlinks: newBacklinks },
        };
      }
    } catch (err) {
      console.warn("Firestore addManualIdeaLink error, fallback:", err);
    }
  }

  const store = getFallbackUserStore(uid);
  const source = store.ideas.find((i) => i.id === sourceIdeaId);
  const target = store.ideas.find((i) => i.id === targetIdeaId);
  if (!source || !target) return null;

  source.links = [...(source.links || []).filter((l) => l.ideaId !== targetIdeaId), { ideaId: targetIdeaId, reason, source: "user" }];
  target.backlinks = [...(target.backlinks || []).filter((b) => b.ideaId !== sourceIdeaId), { ideaId: sourceIdeaId, reason }];

  return { sourceIdea: source, targetIdea: target };
}

export async function removeIdeaLink(
  uid: string,
  sourceIdeaId: string,
  targetIdeaId: string
): Promise<boolean> {
  if (adminDb) {
    try {
      const userRef = adminDb.collection("users").doc(uid);
      const sourceRef = userRef.collection("ideas").doc(sourceIdeaId);
      const targetRef = userRef.collection("ideas").doc(targetIdeaId);

      const [sourceSnap, targetSnap] = await Promise.all([sourceRef.get(), targetRef.get()]);
      if (sourceSnap.exists && targetSnap.exists) {
        const sourceData = sourceSnap.data() as Idea;
        const targetData = targetSnap.data() as Idea;

        const newLinks = (sourceData.links || []).filter((l) => l.ideaId !== targetIdeaId);
        const newBacklinks = (targetData.backlinks || []).filter((b) => b.ideaId !== sourceIdeaId);

        const batch = adminDb.batch();
        batch.update(sourceRef, { links: newLinks, updatedAt: Date.now() });
        batch.update(targetRef, { backlinks: newBacklinks, updatedAt: Date.now() });
        await batch.commit();
        return true;
      }
    } catch (err) {
      console.warn("Firestore removeIdeaLink error, fallback:", err);
    }
  }

  const store = getFallbackUserStore(uid);
  const source = store.ideas.find((i) => i.id === sourceIdeaId);
  const target = store.ideas.find((i) => i.id === targetIdeaId);

  if (source) {
    source.links = (source.links || []).filter((l) => l.ideaId !== targetIdeaId);
  }
  if (target) {
    target.backlinks = (target.backlinks || []).filter((b) => b.ideaId !== sourceIdeaId);
  }
  return true;
}

export async function deleteUserIdea(uid: string, ideaId: string): Promise<boolean> {
  if (adminDb) {
    try {
      const userRef = adminDb.collection("users").doc(uid);
      const docRef = userRef.collection("ideas").doc(ideaId);
      const snap = await docRef.get();
      if (!snap.exists) return false;
      const data = snap.data() as Idea;

      const batch = adminDb.batch();
      batch.delete(docRef);

      // Clean up links and backlinks pointing to this idea across other ideas
      const allIdeasSnap = await userRef.collection("ideas").get();
      allIdeasSnap.docs.forEach((d) => {
        if (d.id === ideaId) return;
        const dData = d.data() as Idea;
        const hasLink = (dData.links || []).some((l) => l.ideaId === ideaId);
        const hasBacklink = (dData.backlinks || []).some((b) => b.ideaId === ideaId);

        if (hasLink || hasBacklink) {
          batch.update(d.ref, {
            links: (dData.links || []).filter((l) => l.ideaId !== ideaId),
            backlinks: (dData.backlinks || []).filter((b) => b.ideaId !== ideaId),
          });
        }
      });

      await batch.commit();
      await updateCategoryCount(uid, data.category, -1);
      return true;
    } catch (err) {
      console.warn("Firestore deleteUserIdea error, using fallback:", err);
    }
  }

  const store = getFallbackUserStore(uid);
  const idx = store.ideas.findIndex((i) => i.id === ideaId);
  if (idx === -1) return false;

  const [removed] = store.ideas.splice(idx, 1);
  // Remove all links and backlinks referencing the deleted idea
  store.ideas.forEach((i) => {
    i.links = (i.links || []).filter((l) => l.ideaId !== ideaId);
    i.backlinks = (i.backlinks || []).filter((b) => b.ideaId !== ideaId);
  });

  const cat = store.categories.find((c) => c.name === removed.category);
  if (cat) cat.ideaCount = Math.max(0, cat.ideaCount - 1);
  return true;
}

export async function clearExampleData(uid: string): Promise<void> {
  if (adminDb) {
    try {
      const userRef = adminDb.collection("users").doc(uid);
      const ideasSnap = await userRef.collection("ideas").where("id", ">=", "ex").get();
      const batch = adminDb.batch();
      ideasSnap.docs.forEach((doc) => {
        if (doc.id.startsWith("ex")) batch.delete(doc.ref);
      });
      await batch.commit();
    } catch (err) {
      console.warn("Firestore clearExampleData error:", err);
    }
  }

  const store = getFallbackUserStore(uid);
  store.ideas = store.ideas.filter((x) => !String(x.id).startsWith("ex"));
  store.ideas.forEach((x) => {
    x.links = (x.links || []).filter((l) => !String(l.ideaId).startsWith("ex"));
    x.backlinks = (x.backlinks || []).filter((b) => !String(b.ideaId).startsWith("ex"));
  });
  store.dumps = store.dumps.filter((d) => !d.example);
  store.example = false;
}

export const clearUserExamples = clearExampleData;

export async function renameCategory(
  uid: string,
  oldName: string,
  newName: string
): Promise<void> {
  if (adminDb) {
    try {
      const ideasSnap = await adminDb
        .collection("users")
        .doc(uid)
        .collection("ideas")
        .where("category", "==", oldName)
        .get();

      const batch = adminDb.batch();
      ideasSnap.docs.forEach((doc) => {
        batch.update(doc.ref, { category: newName, updatedAt: Date.now() });
      });

      const catSnap = await adminDb
        .collection("users")
        .doc(uid)
        .collection("categories")
        .where("name", "==", oldName)
        .get();

      catSnap.docs.forEach((doc) => {
        batch.update(doc.ref, { name: newName });
      });

      await batch.commit();
      return;
    } catch (err) {
      console.warn("Firestore renameCategory error, fallback:", err);
    }
  }

  const store = getFallbackUserStore(uid);
  store.ideas.forEach((i) => {
    if (i.category.toLowerCase() === oldName.toLowerCase()) {
      i.category = newName;
      i.updatedAt = Date.now();
    }
  });

  const cat = store.categories.find((c) => c.name.toLowerCase() === oldName.toLowerCase());
  if (cat) {
    cat.name = newName;
  }
}

export async function mergeCategories(
  uid: string,
  sourceCategory: string,
  targetCategory: string
): Promise<void> {
  if (adminDb) {
    try {
      const ideasSnap = await adminDb
        .collection("users")
        .doc(uid)
        .collection("ideas")
        .where("category", "==", sourceCategory)
        .get();

      const batch = adminDb.batch();
      ideasSnap.docs.forEach((doc) => {
        batch.update(doc.ref, { category: targetCategory, updatedAt: Date.now() });
      });

      const catSnap = await adminDb
        .collection("users")
        .doc(uid)
        .collection("categories")
        .where("name", "==", sourceCategory)
        .get();

      catSnap.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      const count = ideasSnap.size;
      await updateCategoryCount(uid, targetCategory, count);
      await batch.commit();
      return;
    } catch (err) {
      console.warn("Firestore mergeCategories error, fallback:", err);
    }
  }

  const store = getFallbackUserStore(uid);
  let movedCount = 0;
  store.ideas.forEach((i) => {
    if (i.category.toLowerCase() === sourceCategory.toLowerCase()) {
      i.category = targetCategory;
      i.updatedAt = Date.now();
      movedCount++;
    }
  });

  store.categories = store.categories.filter(
    (c) => c.name.toLowerCase() !== sourceCategory.toLowerCase()
  );

  const target = store.categories.find(
    (c) => c.name.toLowerCase() === targetCategory.toLowerCase()
  );
  if (target) {
    target.ideaCount += movedCount;
  } else {
    store.categories.push({
      id: `cat_${Date.now()}`,
      name: targetCategory,
      ideaCount: movedCount,
      color: getCategoryColor(targetCategory, store.categories.length),
      createdAt: Date.now(),
    });
  }
}

async function updateCategoryCount(uid: string, categoryName: string, delta: number) {
  if (!adminDb) return;
  try {
    const catQuery = await adminDb
      .collection("users")
      .doc(uid)
      .collection("categories")
      .where("name", "==", categoryName)
      .limit(1)
      .get();

    if (!catQuery.empty) {
      const doc = catQuery.docs[0];
      const current = doc.data().ideaCount || 0;
      await doc.ref.update({
        ideaCount: Math.max(0, current + delta),
      });
    } else if (delta > 0) {
      await adminDb
        .collection("users")
        .doc(uid)
        .collection("categories")
        .add({
          name: categoryName,
          ideaCount: delta,
          color: getCategoryColor(categoryName),
          createdAt: Date.now(),
        });
    }
  } catch (err) {
    console.warn("Error updating category count:", err);
  }
}
