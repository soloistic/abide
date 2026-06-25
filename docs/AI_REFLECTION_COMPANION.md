# AI Reflection Companion Guardrails

## Purpose

The AI reflection companion is a future optional aid for reflection. Its job is
to help a user notice, name, and revisit what they have already written in
Abide. It must support the product question:

> How is God changing me?

The companion is not a spiritual authority, counselor, pastor, scorekeeper, or
source of pressure. It should help the user stay with their own reflection
rather than replace reflection with generated conclusions.

## Product Boundaries

The companion may:

- ask gentle follow-up questions about a reflection;
- summarize a user's own reflection back to them in plain language;
- help the user notice recurring themes across selected reflections;
- suggest non-prescriptive prompts for prayer, gratitude, repentance, or
  further reflection;
- help draft private testimony material from reflections the user explicitly
  selects;
- explain uncertainty when there is not enough user-provided context.

The companion must not:

- score, rank, grade, or measure a user's holiness, maturity, faithfulness, or
  spiritual progress;
- create streaks, goals, rewards, achievement language, or engagement loops;
- diagnose sin patterns, mental health conditions, trauma, relationships, or
  spiritual authority questions;
- claim to know what God is saying beyond the user's own words and Scripture
  references they provide;
- present fruit frequency as performance or moral status;
- pressure the user to write more often, share publicly, or complete a plan;
- impersonate a pastor, counselor, prophet, or named religious leader.

## User Control and Consent

AI must be opt-in at the point of use. The interface should make it clear when
reflection content will be sent to an AI service.

Before any AI request, the user should be able to see and control the scope of
content being used. Good first scopes are:

- the current draft reflection;
- one saved reflection;
- a small set of selected reflections;
- a bounded date range chosen by the user.

The app should not silently send the full reflection history. It should not send
prayer notes, Scripture references, or older reflections unless they are part of
the user-selected scope.

Generated text should be clearly marked as AI-assisted. The user must be able to
edit, ignore, or discard it before anything is saved.

## Privacy and Data Handling

Before implementation, document the chosen AI provider, what request data is
sent, whether the provider stores data, and how retention is configured. Keep
that documentation user-facing enough to support informed consent.

Implementation should avoid logging raw reflection text, prayer notes, generated
outputs, or AI prompts. If operational logging is needed, prefer request IDs,
latency, model identifiers, token counts, and high-level error categories.

Any future account or multi-user work must revisit these guardrails before AI is
enabled for shared infrastructure.

## UX and Copy Rules

Companion copy should sound invitational, specific, and humble. Prefer language
like:

- "You might reflect on..."
- "One theme you named is..."
- "Would it help to sit with this question?"
- "I may be missing context, but..."

Avoid language like:

- "You are growing fastest in..."
- "Your weakest fruit is..."
- "God is telling you..."
- "Complete today's reflection to keep momentum."
- "You should..."

The interface should keep primary authorship with the user. AI output belongs in
secondary surfaces such as prompt cards, draft suggestions, or review panels,
not as the main saved reflection by default.

## First Implementation Shape

A safe first version should be narrow:

1. User writes or opens a reflection.
2. User chooses an explicit AI action such as "Suggest a follow-up question" or
   "Reflect this back to me."
3. The app shows the exact reflection content that will be used.
4. The user confirms the request.
5. The response appears as a suggestion that can be dismissed or copied into the
   user's own writing.

Do not start with whole-history analysis, automatic dashboard insights,
notifications, or proactive companion messages.

## Evaluation Checklist

Before shipping an AI companion feature, verify that:

- no generated output contains scores, ranks, grades, streaks, or achievement
  framing;
- the user explicitly chooses which reflection content is sent;
- the UI identifies AI-assisted output;
- generated text can be discarded without saving;
- empty, sparse, or difficult reflections receive humble responses rather than
  confident conclusions;
- errors fail calmly without losing user-written reflection text;
- documentation explains provider, data scope, and privacy behavior;
- tests or fixtures cover at least one refusal/redirect case for prohibited
  scoring or authority-like language.

