import json
import re
from openai import OpenAI
from django.conf import settings

_client = None


def get_client() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(api_key=settings.OPENAI_API_KEY)
    return _client


def create_embedding(text: str) -> list:
    """
    Creates an OpenAI embedding for semantic search.
    Uses text-embedding-ada-002 to match what the Confluence sync uses.
    """
    client = get_client()
    response = client.embeddings.create(
        model="text-embedding-ada-002",
        input=text,
    )
    return response.data[0].embedding


# ─── SCORER ──────────────────────────────────────────────────────────────────
# Ported from OpenAI Scoring Agent node in Jira_KB_Checker.json

SCORER_SYSTEM = """You are a senior IT support quality evaluator for ResolveIQ,
an enterprise knowledge management system.

Your task is to assign a SINGLE score (0–10) that reflects how useful a retrieved
Confluence KB article would be to an engineer trying to resolve a specific Jira ticket.

Usefulness is determined by two inseparable factors:
  — RELEVANCE: Does this article address the specific issue in the ticket?
  — ACTIONABILITY: Does this article contain specific enough content to actually resolve it?

A high score requires BOTH. An article that matches the topic but gives vague guidance
is not useful. An article with excellent technical depth on the wrong problem is not useful.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCORING RUBRIC — read every level before deciding
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

10 — DEFINITIVE MATCH
    The article addresses the exact symptom, product, and context in the ticket.
    It contains a precise technical root cause, exact step-by-step resolution with
    full navigation paths or commands, specific affected versions, and clear
    escalation criteria. An engineer could resolve the ticket using this article alone.

9  — NEAR-DEFINITIVE
    Same as 10 but missing one minor element (e.g., version specificity or one
    escalation detail). Still fully actionable for the issue described.

8  — STRONG MATCH
    Directly relevant to the issue and contains specific, actionable steps.
    Root cause is explained but may lack full technical depth. Steps are clear
    enough to follow but may require minor interpretation.

7  — GOOD MATCH
    Clearly about the right product and issue category. Has structured content
    with real steps, but some steps are incomplete, a root cause is assumed
    rather than explained, or version/context specificity is missing.

6  — USEFUL BUT INCOMPLETE
    Addresses the right issue but the content would only partially resolve it.
    Covers some scenarios but not the one described in the ticket, OR the steps
    are correct but too high-level to follow without prior knowledge.

5  — PARTIAL — RELEVANCE WITHOUT DEPTH
    The article is on the right topic but the content is too generic to be
    actionable. Steps like "check your settings" or "restart the application"
    with no specifics. A title match with weak body content. Engineer would
    need to search further.

4  — PARTIAL — DEPTH WITHOUT RELEVANCE
    The article has high-quality, specific technical content but addresses a
    different symptom, version, or sub-problem than what the ticket describes.
    Could provide useful context but would not directly resolve the issue.

3  — WEAK MATCH
    Loosely related topic or product family. The article might provide
    background understanding but has no direct bearing on resolving this
    specific ticket. Content quality is irrelevant at this level.

2  — POOR MATCH
    Superficial connection — perhaps the same product name appears but the
    issue is completely different. Content is either generic filler or
    addresses an unrelated problem entirely.

1  — MISLEADING OR WRONG
    The article appears relevant by title but contains incorrect guidance,
    refers to the wrong product or team, or would send the engineer in the
    wrong direction.

0  — NO MATCH
    Completely unrelated to the ticket topic.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DECISION PROCESS — follow this order
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Step 1 — Identify the core issue in the ticket:
  What product? What symptom? What context or version?

Step 2 — Assess relevance:
  Does the article address that exact product + symptom combination?
  If no → score cannot exceed 4 regardless of content quality.

Step 3 — Assess actionability of the content:
  Does it explain WHY the issue happens (root cause)?
  Does it provide HOW to fix it (specific steps, paths, commands)?
  If the content is vague → score cannot exceed 5 regardless of relevance.

Step 4 — Select the single rubric level that best describes the combination.
  Do not average. Do not calculate. Choose the level whose description
  most accurately reflects what you found in Steps 1–3.

Return ONLY valid JSON. No markdown. No explanation outside the JSON."""

SCORER_USER_TEMPLATE = """JIRA TICKET:
{ticket_full}

RETRIEVED CONFLUENCE ARTICLE:
Title: {title}
Content: {content}
URL: {url}
Vector Similarity: {similarity_score}

Follow the four-step decision process from your instructions and return:

{{
  "score": <integer 0-10>,
  "status": "<Relevant | Partial | No Match | Misleading>",
  "kb_title": "<exact title of this article>",
  "kb_url": "<url of this article>",
  "reason": "<one sentence under 20 words explaining the score>"
}}"""


def score_single_document(ticket_full: str, doc: dict) -> dict:
    """
    Scores one retrieved Pinecone document against the ticket.
    Returns: {"score": int, "status": str, "kb_title": str, "kb_url": str, "reason": str}
    """
    client = get_client()

    prompt = SCORER_USER_TEMPLATE.format(
        ticket_full=ticket_full,
        title=doc["metadata"].get("title", ""),
        content=doc["page_content"][:2000],   # Truncate to avoid token overflow
        url=doc["metadata"].get("url", ""),
        similarity_score=round(doc["score"], 4),
    )

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            temperature=0.2,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": SCORER_SYSTEM},
                {"role": "user", "content": prompt},
            ],
        )
        raw = response.choices[0].message.content
        return json.loads(raw)
    except Exception as e:
        print(f"Scoring error for doc {doc['metadata'].get('title')}: {e}")
        return None


def format_scorecard_comment(scored_docs: list) -> str:
    """
    Formats the Jira comment from scored documents.
    Exact port of the Format Scorecard JavaScript node from Jira_KB_Checker.json.
    """
    results = []
    seen_urls = set()

    for doc in scored_docs:
        if doc is None or doc.get("score") is None:
            continue

        # Clean URL — strip everything after the page ID
        raw_url = doc.get("kb_url", "")
        clean_url = re.sub(r'(/wiki/spaces/[^/]+/pages/\d+).*', r'\1', raw_url)

        # Deduplicate by URL
        if clean_url in seen_urls:
            continue
        seen_urls.add(clean_url)

        results.append({**doc, "kb_url": clean_url})

    # Sort by score, cap at 3
    results.sort(key=lambda x: x.get("score", 0), reverse=True)
    results = results[:3]

    comment = "*ResolveIQ — AI Knowledge Base Analysis*\n\n"

    if not results or results[0].get("score", 0) < 4:
        comment += "*No sufficiently relevant or actionable documentation found.*\n"
        comment += "_A KB draft must be generated before this ticket can be closed._"
        return comment

    article_word = "Article" if len(results) == 1 else "Articles"
    comment += f"*Top {len(results)} Matching KB {article_word}:*\n\n"

    for i, doc in enumerate(results, 1):
        score = round(doc.get("score", 0))
        stars = "★" * score + "☆" * (10 - score)
        comment += f"*{i}. [{doc.get('kb_title', 'Unknown')}|{doc.get('kb_url', '')}]*\n"
        comment += f"Score: {score}/10 {stars}\n"
        comment += f"Status: {doc.get('status', '')}\n"
        comment += f"Reason: {doc.get('reason', '')}\n\n"

    return comment


# ─── WRITER ──────────────────────────────────────────────────────────────────
# Ported from Generate KB Article node in KB_Article_Creator_Unified.json

WRITER_SYSTEM = (
    "Confluence KB technical writer. Use ONLY transcript. Never hallucinate. "
    "Write 'To be completed by reviewing engineer' if unclear. "
    "Remove names. Return article only."
)

WRITER_USER_TEMPLATE = """Create troubleshooting article.
Issue: {ticket_summary}
Transcript: {transcript}
Structure:
h1. {ticket_summary}
h2. Problem
*Problem Statement:* [1-2 sentences]
*Affected Versions:* [from transcript]
h2. Root Cause
[from transcript]
h2. Solution
# Step one
# Step two
h2. Prevention
[steps]
h2. Escalation Path
[info]
h2. Related Articles
To be completed by reviewing engineer"""


def generate_kb_article(ticket_summary: str, transcript: str) -> dict:
    """
    Generates a Confluence KB article in Confluence wiki markup.
    Uses gpt-4o. Output is Confluence wiki markup (h1./h2. syntax), NOT HTML.
    Returns: {"title": str, "wiki_content": str}
    """
    client = get_client()

    prompt = WRITER_USER_TEMPLATE.format(
        ticket_summary=ticket_summary,
        transcript=transcript,
    )

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": WRITER_SYSTEM},
            {"role": "user", "content": prompt},
        ],
    )

    raw_content = response.choices[0].message.content.strip()

    # Extract title from first h1. line
    lines = raw_content.split("\n")
    title = ticket_summary  # Fallback
    for line in lines:
        if line.startswith("h1."):
            title = line.replace("h1.", "").strip()
            break

    return {"title": title, "wiki_content": raw_content}
