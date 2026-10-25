# Voice-First Note-Taking & AI Second-Brain Apps — Product/UX Inspiration for "Thought Dump"

*Research date: 2026-10-25. Many pricing figures come from third-party aggregators and conflict with each other. Conflicts are flagged. Treat all prices as approximate and check vendor pages before quoting them to judges.*

## App-by-app catalog: core flow, recording start, post-processing, transcript vs output, editing, search/ask, export, pricing

### Takeaway
The category splits into three groups. (1) **"Ramble → polished text" apps** (AudioPen, Letterly, TalkNotes, Oasis, Cleft) are built around rewrite styles/presets and an intensity dial. (2) **"Second brain / memory" apps** (Voicenotes, Mem 2.0, Reflect, Limitless, Bee, Plaud) are built around Ask-AI over all recordings plus auto-extracted tasks. (3) **Dictation layers** (Wispr Flow, Superwhisper, Letterly Keyboard) put voice into every text field. Nobody prominent combines all of the following in one mobile flow: one-button dump, auto-split into typed atoms (idea/task/question/reminder), Obsidian-style linked markdown, and a graph. That combination is Thought Dump's whitespace. Big moves since 2025: Meta acquired Limitless (Dec 2025), Amazon agreed to buy Bee (Jul 2025), and Mem relaunched as 2.0 with Voice Mode (Oct 2025).

### Cited Findings

**AudioPen** (ramble → rewritten note; the reference "rewrite styles" app)
- Core feature: a recording is rewritten into presets (e.g., simple/clear, academic, business memo) plus user-defined custom styles. One comparison counts 25+ styles. Other sources don't confirm that count — [Slax comparison](https://slax.com/note/alternatives/audiopen/); [RambleFix](https://ramblefix.com/blog/audiopen); [ToolQuestor](https://toolquestor.com/vs/audiopen-vs-letterly)
- **Rewriting Intensity dial with 3 levels:** Low = cleaned-up transcript only; Medium = rewritten in the chosen style but keeping your vocabulary and tone; High = full rewrite with your choice of style and length — [Joseph Nilo review](https://josephnilo.com/blog/audiopen-review/); [RambleFix](https://ramblefix.com/blog/audiopen)
- "SuperSummaries" combine multiple notes into one. Also: audio file upload, an Apple Watch companion, and multi-language input/output — [Slax](https://slax.com/note/alternatives/audiopen/)
- An offline "Voice Typing" mode in the Mac/Windows apps and iOS keyboard produces raw, unstyled text. AI Rewrite runs in the cloud, and notes sync via an account — [RambleFix](https://ramblefix.com/blog/audiopen)
- Pricing (conflicting): one-time passes of $33/3 mo, $99/1 yr, $159/2 yr that don't auto-renew — [Joseph Nilo](https://josephnilo.com/blog/audiopen-review/). Another source lists a subscription at $4.99/mo or $49.99/yr, with a free tier of 5 notes, 10 AI polishes total and 5-min recordings — [Slax (dated 2026-05)](https://slax.com/note/alternatives/audiopen/)
- Export: no native Obsidian export found. The routes are Zapier ("New Note" trigger → Notion page/database item) — [Zapier](https://zapier.com/apps/audiopen/integrations/notion) — and community Obsidian plugins that receive AudioPen **webhooks**, with templates that can include tags. The webhook setting appears to sit under a "Beta Program" toggle — [LoudThoughts plugin](https://community.obsidian.md/plugins/loud-thoughts); [ObsidianStats AudioPen tag](https://www.obsidianstats.com/tags/audiopen)

**Voicenotes (voicenotes.com)** (founded by Buy Me a Coffee's founder; has since pivoted toward meetings)
- Launched May 2024 as an AI voice-note app. The AI assistant lets you **verbally search** past notes — [TechCrunch 2024](https://techcrunch.com/2024/05/13/buymeacoffees-founder-has-built-an-ai-powered-voice-note-app)
- "Ask your AI" queries notes and sets reminders — [AlternativeTo](https://alternativeto.net/software/voicenotes--ai-voice-notes/about). The App Store copy says it can "remember details, dates, and decisions" — [App Store](https://apps.apple.com/app/voicenotes-ai-voice-notes/id6483293628)
- The current homepage is meeting-focused: bot-free capture for Zoom/Teams/Meet/Webex/Slack and in-person meetings. Summary, key points and action items are ready when the meeting ends. Recording, transcript and key points are stored together. It handles 60+ languages with auto-detection and mid-sentence switching, generates follow-up emails, reports and to-dos, and exports PDF or a Slack share link. Platforms: desktop, iOS, Android, Web, Apple Watch/Wear OS — [voicenotes.com](https://voicenotes.com)
- Privacy messaging: "Private by design," SOC 2 Type II and GDPR, encrypted at every stage, and notes/voice are **never used to train AI** — [voicenotes.com](https://voicenotes.com)
- "Create" turns a transcript into blog drafts, email replies, meeting recaps, or any custom prompt output — [Voicenotes blog](https://voicenotes.com/blog/convert-voice-to-text). "Automate with Tags" (tags trigger automated actions) was added Sept 17, 2025 — [Voicenotes release notes](https://help.voicenotes.com/en/articles/9220745-release-notes)
- Community: a popular subreddit request is "Auto-Summary Based on Tags." There is also a skeptical post about transcription reliability — [r/Voicenotesai via GummySearch](https://gummysearch.com/r/Voicenotesai)
- Pricing: Basic $0 (unlimited recordings, 100 transcription min/week, 30-day history); Pro $9/user/mo (unlimited, live transcription, MCP, imports, integrations); Enterprise $24/user/mo — [yespress listing](https://yespress.io/products/voicenotes.md). App Store in-app prices differ (e.g., $99.99/yr marked discontinued) — [App Store](https://apps.apple.com/app/voicenotes-ai-voice-notes/id6483293628)

**Cleft Notes** (the closest match to Thought Dump's Obsidian angle)
- Transcription runs **on-device**. Recording and transcription work offline, and notes sync when connected. Sign-in is required — [cleftnotes.com](https://www.cleftnotes.com); [App Store](https://apps.apple.com/app/id6479458038)
- Recording surfaces: iPhone, iPad, Mac, Apple Watch, and **CarPlay** — [cleftnotes.com](https://www.cleftnotes.com)
- Output: extracts main points and action items. You pick a **note style**: Structured (sections + bullets), Structured Prose (sections as paragraphs), or Clean Transcript, and you can save custom styles. Each note shows **summary, actions and transcript together** — [cleftnotes.com](https://www.cleftnotes.com)
- Export: **saves Markdown directly into an Obsidian vault** and local Markdown for Logseq. Also exports to Notion, Apple Notes, Apple Reminders, Bear, Craft, Todoist, Things 3, and Zapier — [cleftnotes.com](https://www.cleftnotes.com)
- Pricing: free recordings up to 5 min (30 min paid). $6.99/mo or $39.99/yr — [MakerStack review (7.9/10)](https://makerstack.co/reviews/cleft-review/); AlternativeTo lists ~$8/mo — [AlternativeTo](https://alternativeto.net/software/cleft-notes/about)

**Letterly** (rewrite styles + system keyboard)
- 25–27+ rewrite styles, from light edits to full rewrites, plus custom styles. The count varies by source — [Kripesh Adwani review](https://kripeshadwani.com/letterly-review/); [Unite.ai](https://www.unite.ai/?p=274703)
- A **home-screen widget** gives instant recording — [Unite.ai](https://www.unite.ai/?p=274703)
- The iOS **Letterly Keyboard** (needs Full Access) dictates into Messages, Mail, WhatsApp and other apps — [Letterly blog](https://letterly.app/blog/how-to-use-letterly-keyboard/). A June 2026 update added rewrite options after dictating or selecting text (clean up, shorten, structure, turn into message/email/note), plus a Windows app with dictation in any app — [Releasebot changelog](https://releasebot.io/updates/letterly)
- On Android, dictation uses the AccessibilityService API, and audio is sent to Letterly servers and transcription/AI providers — [Google Play](https://play.google.com/store/apps/details?id=com.draftai)

**TalkNotes**
- 100+ premade output styles (blog posts, task lists, emails, etc.) plus custom styles. Available on iOS and Android, with export and Zapier/webhooks — [talknotes.io](https://talknotes.io/); [Dataconomy](https://dataconomy.com/tools/talknotes/)
- Pricing (conflicting): $19.97/mo or $197/yr with a 7-day trial — [talknotes.io](https://talknotes.io/); a promo of $69/yr — [TalkNotes landing](https://talknotes.io/landings/free-trial); "from $12/mo" — [Dataconomy](https://dataconomy.com/tools/talknotes/)

**Oasis** (identity ambiguous: several products share the name)
- The voice-memo Oasis app opens and starts recording **in one tap**. It strips mumbling and repetition, summarizes rambling, and formats output as an email, outline, tweet, etc. It focuses on memos, not meetings — [Wonder Tools (2023)](https://wondertools.substack.com/p/oasis). Fast Company named it a useful 2023 tool — [Fast Company](https://www.fastcompany.com/91000628/these-were-some-of-the-most-useful-tools-of-2023)
- An iOS listing (Present Communications) shows Basic at $4.99/mo and Pro at $14.99/mo, with sharing to Gmail, iMessage, Notes and Slack — [LogicWeb](https://www.logicweb.com/ai/oasis-ai/). A Mac variant includes a **transcript review step before final output** — [TopAI.tools](https://topai.tools/t/theoasis)

**Mem 2.0 (Voice Mode)**
- Mem 2.0 relaunched ~Oct 1, 2025 as a rebuilt product with full offline support (web, desktop, mobile). It was on Product Hunt Oct 2, 2025 — [Mem blog](https://get.mem.ai/blog/mem-2-dot-0); [Hunted.space](https://hunted.space/product/mem-2-0)
- Voice Mode is pitched as "turn your brain dumps into beautifully organized notes." Mem **automatically determines your intent** and chooses how to interpret the transcript. You can pause, tap Done, then **accept the note or refine it with follow-up instructions** — [Mem help: Voice Mode](https://help.mem.ai/features/voice-mode.md); [Mem voice feature page](https://get.mem.ai/features/voice)
- Meeting capture (local system audio + mic, no bot) works only in the Mac/Windows apps — [Mem voice page](https://get.mem.ai/features/voice); [Mem help](https://help.mem.ai/features/voice-mode.md)

**Otter.ai** (meetings incumbent)
- Free tier: 300 min/mo with a 30-min cap per conversation, including AI Chat and summaries. Pro is ~$8.33/user/mo annual or $16.99 monthly, with 1,200 min, custom vocabulary and 10 imports. Business is ~$20/seat — [eesel](https://www.eesel.ai/blog/otter-ai); [Jamie](https://www.meetjamie.ai/blog/otter-ai-pricing)
- The OtterPilot bot joins calls and extracts action items. In Oct 2025 Otter reportedly launched an enterprise API, an **MCP server**, and an agent that searches company meeting notes — [eesel](https://www.eesel.ai/blog/otter-ai)

**Granola** (best-in-class "your notes + AI transcript" merge)
- Bot-free: it listens to computer audio. You type shorthand bullets during the meeting, and AI **"enhances" your notes using the transcript**. Templates and "Recipes" are customizable prompts for action items and summaries — [SkillScouter review](https://skillscouter.com/granola-review/)
- May 2025: raised $43M at a $250M valuation and added collaboration and sharing. Non-users can ask AI questions of shared notes — [TechCrunch](https://techcrunch.com/2025/05/14/ai-note-taking-app-granola-raises-43m-at-250m-valuation-launches-collaborative-features)
- Pricing: free Basic (30-day viewable history; older notes are kept but locked); Business $14/user/mo; Enterprise $35/user/mo (adds SSO, API, opt-out of model training) — [Granola blog](https://www.granola.ai/blog/granola-pricing-plans-features-roi); [Carly](https://www.usecarly.com/blog/granola-pricing/). Android reportedly launched July 2026 (single source) — [SkillScouter](https://skillscouter.com/granola-review/)

**Limitless (pendant + app)**: **acquired by Meta, Dec 2025**
- Meta acquired Limitless (formerly Rewind). Pendant sales stopped. Existing owners got the Unlimited plan free, with support for at least a year. Rewind's Mac capture was disabled Dec 19, 2025. Service ended in the EU, UK, Brazil, Israel, South Korea, Turkey and China, with a data-export deadline — [9to5Mac](https://9to5mac.com/2025/12/05/rewind-limitless-meta-acquisition/); [Social Samosa](https://www.socialsamosa.com/news-2/meta-acquires-limitless-10910875)
- App UX: a chronological log of conversations. **Ask AI answers link to the source entries.** Commitments and unfinished tasks surface as reminders and "daily insights" — [yespress](https://yespress.io/products/limitless.md). **Daily notifications** deliver a morning digest or task list — [Limitless announcements](https://feedback.limitless.ai/announcements/launched-daily-notifications-ask-ai-anything-on-desktop)
- Reception: users praised next-day summaries and to-dos. Complaints: noise, mislabeled speakers, battery anxiety — [Thinkonic review](https://thinkonic.substack.com/p/limitless-ai-pendant-review); [yespress](https://yespress.io/products/limitless.md)

**Plaud NotePin / NotePin S** (hardware recorder + app)
- NotePin S lists at $179. The free Starter plan has 300 min/mo. Pro is ~$19.99/mo (1,200 min) and Unlimited ~$29.99/mo, both billed annually — [Plaud EU](https://eu.plaud.ai/products/plaud-notepin-s); [Plaud Unlimited](https://ca.plaud.ai/products/plaud-ai-annual-unlimited-plan-monthly)
- 10,000+ summary templates (meetings, interviews, lectures). Custom templates are in paid tiers. Plaud Desktop launched Jan 2026 — [MuyComputer](https://www.muycomputer.com/2026/01/08/plaud-presenta-el-notepin-s-y-plaud-desktop/)
- "Ask Plaud" (beta) pulls quotes, clarifies details and generates next steps, with **"source-based answers"** — [Plaud EU](https://eu.plaud.ai/products/plaud-notepin-s). An older review cites $169 hardware and a near-$400/yr Unlimited plan — [Tom's Guide](https://tomsguide.com/ai/plaud-notepin-review)

**Bee** (wristband): **Amazon agreed to acquire it, July 2025**
- $49.99 bracelet + $19/mo subscription, plus an Apple Watch app. It records conversations, summarizes the day, suggests to-dos and recalls details. Users can optionally connect email, calendar, contacts, location, photos and reminders — [TechCrunch](https://techcrunch.com/2025/07/22/amazon-acquires-bee-the-ai-wearable-that-records-everything-you-say/); [Engadget](https://engadget.com/ai/amazon-is-acquiring-an-ai-wearable-that-listens-to-everything-you-do-221103233.html)
- Bee reportedly developed **recording boundaries by topic and location**. The Verge found it confused real conversations with TV/TikTok audio. Privacy concerns were raised given Alexa's history — [Tom's Guide](https://www.tomsguide.com/ai/amazon-buys-wearable-ai-startup-bee-a-wrist-device-that-hears-and-transcribes-every-word-you-speak)
- Deal closing status was unconfirmed in the sources found.

**Reflect (voice)**
- Tap the mic, and Whisper-based transcription is **appended to today's Daily Note** — [Reflect Academy](https://reflect.academy/audio-recordings); [Reflect blog](https://reflect.app/blog/new-import-options-whisper-desktop-integration-and-enhanced-search). It later added a GPT pass to format and polish the transcript — [Reflect blog](https://reflect.app/blog/voice-notes-will-change-note-taking)
- Trust: Reflect says it **deletes audio and plain-text transcripts as soon as they're processed** — [Reflect Academy](https://reflect.academy/audio-recordings). This is the opposite of Thought Dump's "keep originals."
- Backlinks/graph-style notes and chat with your notes — [Reflect blog](https://reflect.app/blog/voice-notes-will-change-note-taking). A user request to insert voice at the cursor, not only in the Daily Note, is marked in progress — [Reflect roadmap](https://roadmap.reflect.app/feature-requests/p/allow-voice-transcriptions-to-be-added-to-where-the-courser-is-and-not-just-on-t)

**Apple Notes / Journal**
- Notes (iOS 18): paperclip → Record Audio gives a live, **editable transcript** (iPhone 12+). Apple Intelligence summaries need iOS 18.1 on iPhone 15 Pro/16. Phone call recordings land in Notes with transcripts — [AppleInsider](https://appleinsider.com/articles/24/06/13/record-summarize-and-transcribe-audio-with-apple-notes-on-ios-18); [PopSci](https://www.popsci.com/diy/how-to-record-audio-make-transcripts-iphone); [Tom's Guide](https://www.tomsguide.com/phones/iphones/ios-18-getting-the-ability-to-record-calls-and-create-transcripts-how-it-works)
- Journal: record audio in an entry → review the transcription → "Add Transcript to Entry." This is an **explicit user step to promote the transcript, with audio kept alongside**. English only — [Apple Support](https://support.apple.com/en-me/guide/iphone/iph492ee70a8/ios); [iPhone Life (iOS 26)](https://iphonelife.com/content/how-to-use-audio-journaling-iphone). Journal came to iPad/Mac with iOS/macOS 26 — [TechRadar](https://www.techradar.com/tablets/ipad/ipados-26-adds-the-iphones-journal-app-to-ipad-and-i-think-it-makes-total-sense)

**Google Recorder (Pixel)**
- On-device Gemini Nano summaries on Pixel 8+, in 7 languages, for recordings of 5 min to 1 hr — [Google Help](https://support.google.com/pixelphone/answer/16267698). The format is **three bullets** covering speaker names, key takeaways and themes. Google moved from cloud to on-device processing for privacy. Summaries **increased engagement** (per the blog title) — [Android Developers Blog](https://android-developers.googleblog.com/2024/08/recorder-app-on-pixel-sees-boost-in-engagement-with-gemini-nano.html)
- 2024 reviews noted "Transcript is too long" errors on longer recordings. Export to Google Docs — [Android Authority](https://androidauthority.com/pixel-recorder-google-pixel-9-3473920)

**Superwhisper / Wispr Flow** (dictation layers)
- Superwhisper: works fully offline or with cloud models. **"Modes"** apply AI cleanup per context (email, note, casual message). Custom modes and bring-your-own API keys. ~$8.49/mo, $84.99/yr, ~$249.99 lifetime. A rival claims the lifetime price rose to $849 (unverified) — [ClickUp](https://clickup.com/blog/wispr-flow-vs-superwhisper/); [Superwhisper vs page](https://ai.superwhisper.com/vs/wispr-flow/pricing); [Wispr blog](https://wisprflow.ai/post/wispr-flow-vs-superwhisper)
- Wispr Flow: cloud-only, system-wide on Mac/Windows/iOS/Android. A **personal dictionary that learns names/jargon**, voice "snippets," and a meeting notetaker. Free Basic (~2,000 words/week); Pro $15/mo or $12/mo annual — [getvoibe](https://www.getvoibe.com/resources/wispr-flow-vs-superwhisper/); [Willow](https://willowvoice.com/blog/super-whisper-vs-wispr-flow-comparison-reviews-and-alternatives-in-2025)

### Inferences
- **Rewrite style + intensity** (AudioPen, Letterly, TalkNotes, Cleft) is table stakes, so it won't differentiate Thought Dump. **Typed splitting** into idea/task/question/reminder atoms with links is rarer: Mem's "auto-intent" and Cleft's "actions" come closest.
- Cleft is the most direct competitor on the "Obsidian markdown" angle. Its weakness is that it outputs one structured note per recording, not atomic linked notes plus a graph.
- The acquisitions of Limitless and Bee validate "AI memory" as a category judges will recognize. They also highlight trust and privacy risk, and that's where messaging about local-first storage and kept originals can stand out.
- Granola's "your rough bullets + AI fill-in" pattern could be adapted: let users type a word or two before or after a dump to steer the split.

### Gaps
- Official pricing pages for AudioPen, Cleft, Voicenotes, TalkNotes and Superwhisper were not verified directly. All prices are third-party and conflicting.
- Recording-start specifics (lock-screen widget, Action Button, Siri Shortcuts, Control Center) were not confirmed for most apps. Only Letterly (home-screen widget), Oasis (one tap), Cleft (Watch, CarPlay), Voicenotes/AudioPen (Watch) and Reflect (mic tap) are sourced. Hold-to-record vs tap-to-toggle conventions weren't documented in any source.
- Oasis's identity is ambiguous. It's unclear whether theoasis.com is the same product as the Wonder Tools-reviewed app or still active.
- The Bee/Amazon deal's closing and post-acquisition app changes were not confirmed. No 2026 update on Limitless pendant support was found.
- No source detailed how any app visually links derived notes back to timestamps in the original audio. Limitless "links answers to entries" is the closest.

## Retention & engagement patterns (daily prompts, streaks, resurfacing, digests, "on this day")

### Takeaway
Proven retention mechanics in adjacent apps: **"On This Day"** resurfacing (Day One users call it the best feature), **streaks** with milestones and backfill to repair them (Day One), a **daily resurfacing email** (Readwise), and **morning digest/to-do notifications** (Limitless). Google says on-device summaries boosted Recorder engagement. Voice apps themselves rarely ship streaks or resurfacing, so this is an open lane.

### Cited Findings
- Day One "On This Day" lists entries from 1, 2+ years ago on the same date. Users describe it as "THE single best feature" — [Day One streak story](https://dayoneapp.com/blog/streak-story-david-geveke/); [Day One tips](https://dayoneapp.com/blog/day-one-journaling-tips/)
- Day One streaks show at the top of the journal menu, with milestone celebrations (week/month/year). **Filling a missed date restores the streak** — [Day One tips](https://dayoneapp.com/blog/day-one-journaling-tips/). On This Day and streaks are reportedly in the free tier — [APKMirror 2026.10 notes](https://www.apkmirror.com/apk/automattic-inc/day-one-journal/day-one-diary-daily-journal-2026-10-release/)
- Readwise resurfaces saved highlights via a **daily email + app**, marketed as spaced repetition/active recall. Highlights can become flashcards. These are vendor claims with no independent study — [Readwise](https://readwise.io); [App Store](https://apps.apple.com/us/app/-/id1476885528)
- Limitless: daily notifications deliver a morning digest or task list, and "daily insights" surface commitments you made in conversation — [Limitless announcements](https://feedback.limitless.ai/announcements/launched-daily-notifications-ask-ai-anything-on-desktop); [yespress](https://yespress.io/products/limitless.md)
- Bee: daily activity summaries and suggested to-dos — [TechCrunch](https://techcrunch.com/2025/07/22/amazon-acquires-bee-the-ai-wearable-that-records-everything-you-say/)
- Google reported a "boost in engagement" in Recorder after adding Gemini Nano summaries — [Android Developers Blog](https://android-developers.googleblog.com/2024/08/recorder-app-on-pixel-sees-boost-in-engagement-with-gemini-nano.html)
- Voicenotes users request auto-summaries based on tags — [r/Voicenotesai](https://gummysearch.com/r/Voicenotesai)

### Inferences
- For Thought Dump, an **"Echoes" card** at the top of Brain could show related past ideas resurfaced when a new dump is semantically similar ("You said something like this 12 days ago"). It reuses the embeddings already needed for Ask, so it's cheap and visibly "AI second brain."
- A **weekly digest** ("This week you had 14 ideas, 3 open questions, 5 tasks — top theme: X") is one LLM call over the week's atoms and is very demo-able.
- A **daily voice prompt** ("What's one thing you're stuck on?") under the record button adds empty-state value and a reason to come back.

### Gaps
- No quantitative retention data (D7/D30) was found for any voice-note app.
- No sourced evidence was found that AudioPen, Cleft, Letterly or TalkNotes offer streaks, prompts or resurfacing.

## Trust & provenance (keeping originals, showing AI-derived vs source, privacy messaging)

### Takeaway
Apps split sharply. Some **keep everything** (Voicenotes stores recording + transcript + key points together; Cleft shows summary/actions/transcript in one note; Apple Journal keeps audio with an opt-in transcript). Others **delete originals** (Reflect deletes audio and transcript after processing). Provenance is strongest where answers cite sources (Limitless links answers to entries; Ask Plaud promises "source-based answers"). Standard privacy copy: "never used to train AI," SOC 2/GDPR, on-device processing, no meeting bot.

### Cited Findings
- Voicenotes: recording, transcript and key points live in one place. Its copy: "Private by design," SOC 2 Type II, GDPR, encrypted, never used to train AI — [voicenotes.com](https://voicenotes.com)
- Cleft: on-device transcription, works offline, summary + actions + transcript shown together, a "Clean Transcript" style for near-verbatim output, and a Trust Center — [cleftnotes.com](https://www.cleftnotes.com)
- Reflect deletes audio and plain-text transcriptions as soon as they're processed — [Reflect Academy](https://reflect.academy/audio-recordings)
- Apple Journal requires a review step ("Add Transcript to Entry") before the transcript enters the entry — [Apple Support](https://support.apple.com/en-me/guide/iphone/iph492ee70a8/ios). Apple Notes transcripts are editable — [PopSci](https://www.popsci.com/diy/how-to-record-audio-make-transcripts-iphone)
- An Oasis Mac variant has a transcript review step before final output — [TopAI.tools](https://topai.tools/t/theoasis)
- Limitless Ask AI links answers to the related entries — [yespress](https://yespress.io/products/limitless.md). Ask Plaud promises "source-based answers" — [Plaud EU](https://eu.plaud.ai/products/plaud-notepin-s)
- Google Recorder moved summaries on-device for privacy — [Android Developers Blog](https://android-developers.googleblog.com/2024/08/recorder-app-on-pixel-sees-boost-in-engagement-with-gemini-nano.html)
- Bee reportedly lets users set recording boundaries by topic/location. Always-listening devices drew privacy criticism — [Tom's Guide](https://www.tomsguide.com/ai/amazon-buys-wearable-ai-startup-bee-a-wrist-device-that-hears-and-transcribes-every-word-you-speak)
- Granola Enterprise lets teams opt out of model training — [SkillScouter](https://skillscouter.com/granola-review/)
- Shutdown risk is real: Limitless ended service in multiple regions with a data-export deadline after the Meta deal — [9to5Mac](https://9to5mac.com/2025/12/05/rewind-limitless-meta-acquisition/)
- Mem lets users accept or refine the AI note with follow-up instructions before it's saved — [Mem help](https://help.mem.ai/features/voice-mode.md)

### Inferences
- A **"Source" chip on every card** (🎙 Dump #42 · 0:37) that plays the audio from that timestamp would be visible, trustworthy provenance that none of the cataloged apps clearly do at the atom level. Word-level timestamps from Whisper/most STT APIs make this feasible.
- **"Your notes are plain markdown files you own"** is a strong trust pitch after the Limitless/Rewind shutdowns. Pair it with "export your whole vault as .zip."
- Mark AI-generated text distinctly (e.g., an ✨ tag or subtle tint) and show an "edited by you" state once a user changes it.

### Gaps
- No source showed a UI that maps each derived note back to its timestamp in the recording, so the inference above is an opportunity, not a documented pattern.

## Onboarding & empty states

### Takeaway
No sources were found that document first-run flows or empty states for these voice apps. This is a research gap. Indirectly: Voicenotes has a beginner getting-started help article, Letterly's keyboard setup needs a multi-step permission flow (Full Access), and Day One uses prompts and streaks.

### Cited Findings
- Voicenotes has a "Getting started… creating and setting up your Voicenotes account" help article (content not reviewed) — [Voicenotes Help](https://help.voicenotes.com/en/articles/10775984-getting-started-with-voicenotes-a-beginner-s-guide-to-creating-and-setting-up-your-voicenotes-account)
- The Letterly keyboard requires Settings → Keyboards → enable Letterly → Allow Full Access. That's a multi-step permission onboarding — [Letterly blog](https://letterly.app/blog/how-to-use-letterly-keyboard/)
- Apple Journal recording starts by tapping the audio icon and granting mic permission — [iPhone Life](https://iphonelife.com/content/how-to-use-audio-journaling-iphone)
- Free tiers act as onboarding funnels: AudioPen 5 notes/5-min recordings ([Slax](https://slax.com/note/alternatives/audiopen/)), Cleft 5-min recordings ([MakerStack](https://makerstack.co/reviews/cleft-review/)), Voicenotes 100 min/week ([yespress](https://yespress.io/products/voicenotes.md)), Otter 300 min/mo ([eesel](https://www.eesel.ai/blog/otter-ai))

### Inferences
- For a hackathon, **pre-seed the vault with one example dump** (audio + transcript + 6 split atoms + links + a mini graph) so judges see the full value without recording. Add a **"Try a sample ramble"** button that plays a canned recording through the real pipeline.
- Empty state for Record: the big button plus a rotating prompt ("Dump what's on your mind — ideas, worries, to-dos, all mixed is fine"). Empty Brain: "Your first dump will appear here as cards."
- Ask for mic permission only on the first tap of Record, with a one-line explanation, not on app launch.

### Gaps
- No primary sources on first-run screens, sample content, or empty-state copy for AudioPen, Cleft, Letterly, TalkNotes, Mem, Granola, etc. Checking App Store screenshots or installing the apps would fill this.

## Speech-to-text providers (cost & quality for a hackathon)

### Takeaway
Batch transcription is now very cheap. **OpenAI gpt-4o-mini-transcribe (~$0.003/min)** and **AssemblyAI Universal-2 (~$0.0025/min)** are the cheapest mainstream options. **Groq whisper-large-v3(-turbo)** has a free tier, which is ideal for a hackathon. OpenAI's 25 MB upload cap and the fact that only whisper-1 still returns word-level timestamps/SRT matter for "tap a card to hear the moment" features. Reflect uses Whisper. Pick one with word timestamps if you want audio-linked provenance.

### Cited Findings
- OpenAI: whisper-1 $0.006/min, 25 MB file cap, billed to the second — [BrassTranscripts](https://brasstranscripts.com/blog/openai-whisper-api-pricing-2025-self-hosted-vs-managed); [ConvertAudioToText](https://convertaudiototext.com/blog/openai-whisper-api-pricing-2026). gpt-4o-transcribe ~$0.006/min ($0.36/hr); gpt-4o-mini-transcribe ~$0.003/min ($0.18/hr) — [ConvertAudioToText 2026](https://convertaudiototext.com/blog/speech-to-text-api-pricing-2026). **Only whisper-1 still returns word-level timestamps and SRT/VTT** — [ConvertAudioToText](https://convertaudiototext.com/blog/openai-whisper-api-pricing-2026). Diarization needs a separate model and isn't supported in Realtime — [ConvertAudioToText 2026](https://convertaudiototext.com/blog/speech-to-text-api-pricing-2026)
- AssemblyAI: Universal-2 $0.15/hr batch; Universal-3.5 Pro $0.21/hr; Universal-Streaming $0.15/hr — [ConvertAudioToText 2026](https://convertaudiototext.com/blog/speech-to-text-api-pricing-2026)
- Deepgram Nova-3: monolingual pre-recorded $0.462/hr; streaming $0.288/hr (promo). Diarization/redaction +$0.002/min each, keyterm prompting +$0.0013/min — [HappyRobot](https://www.happyrobot.ai/hub/deepgram-pricing); [ConvertAudioToText 2026](https://convertaudiototext.com/blog/speech-to-text-api-pricing-2026). Multilingual batch $0.39/hr — [Soniox comparison](https://soniox.com/compare/stt/pricing)
- ElevenLabs Scribe v2: ~$0.22–$0.27/hr batch (sources conflict); Realtime $0.39/hr. Credits are shared with other ElevenLabs products — [ConvertAudioToText 2026](https://convertaudiototext.com/blog/speech-to-text-api-pricing-2026); [Soniox](https://soniox.com/compare/stt/pricing)
- Groq: whisper-large-v3 $0.111/hr; whisper-large-v3-turbo $0.04/hr; minimum 10-sec billing. The free tier needs no card, with rate limits (~2,000 transcription requests/day per one source). File limits conflict (25 MB free vs 100 MB) — [MorphLLM Groq pricing (Oct 2026)](https://www.morphllm.com/groq-pricing); [eesel Groq](https://eesel.ai/blog/groq-pricing)
- Real-world use: Reflect uses Whisper — [Reflect Academy](https://reflect.academy/audio-recordings). Cleft uses on-device transcription — [cleftnotes.com](https://www.cleftnotes.com). Wispr Flow's personal dictionary and Deepgram's keyterm prompting address names/jargon — [getvoibe](https://www.getvoibe.com/resources/wispr-flow-vs-superwhisper/); [HappyRobot](https://www.happyrobot.ai/hub/deepgram-pricing)

### Inferences
- **Hackathon recommendation:** Groq Whisper (free, fast) or OpenAI gpt-4o-mini-transcribe ($0.003/min, so ~1,000 one-minute demo dumps ≈ $3). Use whisper-1 or Deepgram/AssemblyAI if you need word timestamps for audio-linked cards. Keep dumps under ~25 MB, e.g., record compressed m4a/webm on the phone, or chunk.
- A **custom vocabulary/keyterms** field ("names I say often") is a cheap accuracy win and mirrors Wispr Flow's dictionary.

### Gaps
- No independent, current WER benchmarks were gathered. Quality claims are not compared here. All prices are third-party aggregator figures.
- I didn't verify which STT vendor AudioPen, Voicenotes, Letterly or TalkNotes use. (A Deepgram "AI apps" directory lists an "Oasis" page, which is not proof of usage — [Deepgram](https://deepgram.com/ai-apps/oasis).)

## Accounts & cloud sync backends (beginner-friendly comparison)

### Takeaway
For a beginner team, **Supabase** (Postgres + Auth + Storage + pgvector in one, flat $25 Pro) is the most-recommended all-in-one. It fits Thought Dump well: audio files go in Storage, markdown/atoms in Postgres, embeddings in pgvector for Ask. **Firebase** is easiest for mobile/realtime but has uncapped pay-as-you-go risk. **Convex** suits TypeScript-first reactive apps and has file storage; its auth is newer, so teams often pair it with **Clerk**, whose free tier is now 50k monthly retained users.

### Cited Findings
- Supabase free plan: 500 MB DB, 1 GB file storage, 50,000 auth MAU. Auth covers email/password, magic links, phone OTP and 20+ OAuth providers. Pro is a flat $25/mo — [Causo guide](https://hub.causo.ai/guides/supabase-vs-alternatives-founders-2026); [AlexCloudstar](https://www.alexcloudstar.com/blog/supabase-vs-firebase-2026/)
- Firebase Spark (free): 1 GB Firestore, 50K reads/day, auth, hosting. Auth limits conflict across sources (50K MAU vs 10K phone auths). Blaze pay-as-you-go has **no spending cap by default**, so set budget alerts — [AlexCloudstar](https://www.alexcloudstar.com/blog/supabase-vs-firebase-2026/); [RapidDevelopers](https://rapidevelopers.com/vs/supabase-vs-firebase)
- Convex: reactive, TypeScript-native (queries are functions, UI auto-updates), built-in file storage, newer Convex Auth (many pair it with Clerk/Auth0) — [AICoolies](https://aicoolies.com/comparisons/supabase-vs-firebase-vs-convex); [TheSwiftKit](https://theswiftk.it.com/blog/supabase-vs-convex-vs-appwrite-ios). Free plan: 1M function calls/mo, 0.5 GB DB, 1 GB files, meant for 1–2 devs prototyping. Pro is $25/dev/mo — [CostBench](https://costbench.com/software/database-as-service/convex/free-plan/); [Convex FAQ](https://www.convex.dev/pricing/faq)
- Clerk: the free Hobby tier rose to **50,000 monthly retained users** on Feb 5, 2026 (from 10k). Pro $25/mo — [Clerk](https://clerk.com/articles/clerk-pricing-explained)
- Sources broadly recommend Supabase as the beginner default, Firebase for mobile/realtime, and Convex for TS-first realtime — [Causo guide](https://hub.causo.ai/guides/supabase-vs-alternatives-founders-2026)
- Context: competitors require sign-in (Cleft) and sync via accounts (AudioPen) — [cleftnotes.com](https://www.cleftnotes.com); [RambleFix](https://ramblefix.com/blog/audiopen)

### Inferences
- **Suggested path:** ship the hackathon local-first (files/IndexedDB or device storage) with no login. Add Supabase later. One SDK covers auth (magic link = no password UX), a `notes`/`atoms`/`links` table, a Storage bucket for audio, and pgvector for Ask-your-notes. Row-Level Security gives per-user isolation.
- If the stack is TypeScript/React and the team wants live-updating cards without writing sync code, Convex + Clerk is the alternative.

### Gaps
- I found no sources on which backends AudioPen, Voicenotes, Cleft, Letterly, etc. actually use.

## Ranked shortlist: borrowable ideas for Thought Dump (effort + judge impact)

### Takeaway
The highest-leverage ideas make the AI's work **visible and trustworthy** in a 2-minute demo: atom cards tagged by type, each linked back to the exact audio moment, then an Ask answer that cites those cards. Ranked below by (judge impact ÷ effort).

### Cited Findings
(Each idea's precedent; the rationale is in Inferences.)
1. Typed auto-split with intent detection — precedent: Mem auto-determines intent ([Mem help](https://help.mem.ai/features/voice-mode.md)); Cleft/Voicenotes/Bee extract action items ([cleftnotes.com](https://www.cleftnotes.com); [voicenotes.com](https://voicenotes.com); [TechCrunch Bee](https://techcrunch.com/2025/07/22/amazon-acquires-bee-the-ai-wearable-that-records-everything-you-say/))
2. Cited "Ask" answers linking to source notes — precedent: Limitless ([yespress](https://yespress.io/products/limitless.md)); Ask Plaud ([Plaud](https://eu.plaud.ai/products/plaud-notepin-s))
3. Summary/actions/transcript shown together + style toggle — precedent: Cleft ([cleftnotes.com](https://www.cleftnotes.com)); AudioPen intensity dial ([Joseph Nilo](https://josephnilo.com/blog/audiopen-review/))
4. Accept-or-refine-by-voice after a dump — precedent: Mem ([Mem help](https://help.mem.ai/features/voice-mode.md))
5. Direct Obsidian-vault markdown export — precedent: Cleft ([cleftnotes.com](https://www.cleftnotes.com)); AudioPen webhooks → Obsidian plugin ([LoudThoughts](https://community.obsidian.md/plugins/loud-thoughts))
6. On This Day / resurfacing — precedent: Day One ([Day One tips](https://dayoneapp.com/blog/day-one-journaling-tips/)); Readwise ([Readwise](https://readwise.io))
7. Morning digest / weekly recap — precedent: Limitless daily notifications ([Limitless](https://feedback.limitless.ai/announcements/launched-daily-notifications-ask-ai-anything-on-desktop)); Google Recorder's 3-bullet summary boosted engagement ([Android Dev Blog](https://android-developers.googleblog.com/2024/08/recorder-app-on-pixel-sees-boost-in-engagement-with-gemini-nano.html))
8. One-tap recording + home-screen widget — precedent: Oasis ([Wonder Tools](https://wondertools.substack.com/p/oasis)); Letterly widget ([Unite.ai](https://www.unite.ai/?p=274703))
9. Personal vocabulary for names/jargon — precedent: Wispr Flow dictionary ([getvoibe](https://www.getvoibe.com/resources/wispr-flow-vs-superwhisper/)); Deepgram keyterms ([HappyRobot](https://www.happyrobot.ai/hub/deepgram-pricing))
10. Streaks with backfill — precedent: Day One ([Day One tips](https://dayoneapp.com/blog/day-one-journaling-tips/))
11. Privacy/ownership messaging — precedent: Voicenotes "never used to train AI" ([voicenotes.com](https://voicenotes.com)); Cleft on-device ([cleftnotes.com](https://www.cleftnotes.com)); contrast with Limitless's shutdown ([9to5Mac](https://9to5mac.com/2025/12/05/rewind-limitless-meta-acquisition/))
12. Knowledge graph of linked atoms — precedent: Reflect backlinks ([Reflect blog](https://reflect.app/blog/voice-notes-will-change-note-taking))

### Inferences
**Ranked shortlist:**

1. **Color-coded atom cards from one dump (Idea / Thought / Question / Task / Reminder), animating in after processing.** Effort: **Low–Med** (one structured-JSON LLM call). Judge impact: **Very high**. This is the core "wow" and unique versus rewrite-style apps.
2. **"🎙 Source" chip on every card that plays the original audio at that timestamp, with the matching transcript span highlighted.** Effort: **Med** (needs word timestamps: whisper-1/Deepgram/AssemblyAI; ask the LLM to return the span). Judge impact: **Very high**. It shows trust and provenance, and no cataloged app clearly does this per atom.
3. **Ask tab with cited answers**: each answer shows tappable chips for the cards/dumps it used. Effort: **Med** (embeddings + top-k + "cite IDs" prompt). Judge impact: **High**. It proves "second brain," not just a transcriber.
4. **Pre-seeded demo vault + "Try a sample ramble" button.** Effort: **Low**. Judge impact: **High**. Judges see the full pipeline, graph and Ask in 30 sec, even if the mic or Wi-Fi fails on stage.
5. **"Echoes": resurfacing related past ideas when a new dump lands** ("This connects to 'Podcast idea' from Oct 12") and auto-creating a `[[link]]`. Effort: **Low–Med** (reuses Ask embeddings). Judge impact: **High**. It visibly builds the graph and is a retention hook.
6. **Accept-or-refine after a dump**: hold the button again and say "make the second one a task for Friday." Effort: **Med**. Judge impact: **Med–High**. Voice-native editing; precedent is Mem.
7. **Download vault as Obsidian .zip (markdown + YAML frontmatter + [[wikilinks]] + audio attachments).** Effort: **Low**. Judge impact: **Med–High**. A concrete "you own your data" answer, competitive with Cleft.
8. **Tri-view toggle per dump: Cards ⇄ Clean note ⇄ Raw transcript** (Cleft-style), optionally with an AudioPen-style "intensity" slider. Effort: **Low**. Judge impact: **Med**.
9. **Weekly / morning digest card** ("This week: 14 ideas, 3 open questions, 5 tasks; top theme: …"). Effort: **Low**. Judge impact: **Med**. Shows engagement thinking.
10. **Knowledge-graph view** (force-directed graph of atoms + links, colored by type). Effort: **Med** (a library like react-force-graph/d3). Judge impact: **High** visually, but only if the links are meaningful. Build it after #1 and #5.
11. **Daily prompt under the Record button + light streak counter with backfill.** Effort: **Low**. Judge impact: **Low–Med**.
12. **"My words" vocabulary list passed to STT/LLM** (names, project jargon). Effort: **Low**. Judge impact: **Low–Med**. Accuracy win; demo it with a tricky name.

**Avoid or defer:** always-on ambient recording (the Bee/Limitless privacy backlash), meeting-bot integrations (crowded: Otter, Granola), 100+ rewrite styles (commodity), and system keyboards/widgets (high effort on mobile web/React Native for little demo payoff).

### Gaps
- Effort estimates assume a web/React Native stack with an LLM API and are judgment calls, not sourced.
- Judge-impact ratings are inferences. No source on hackathon judging criteria was consulted.
