"""
GitHub 網羅的データ収集スクリプト
Usage: python collect_github_data.py
出力: ../data/github.json
"""

import json
import os
import sys
import urllib.request
import urllib.error
from datetime import datetime

GITHUB_USERNAME = "emar27181"
GITHUB_API_URL = "https://api.github.com/graphql"
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "../data/github.json")

# ---- GraphQL queries ----

PROFILE_QUERY = """
query($login: String!) {
  user(login: $login) {
    name
    login
    bio
    company
    location
    email
    websiteUrl
    avatarUrl
    createdAt
    followers { totalCount }
    following { totalCount }
    repositories(privacy: PUBLIC) { totalCount }
    starredRepositories { totalCount }
    gists(privacy: PUBLIC) { totalCount }
    pinnedItems(first: 6, types: REPOSITORY) {
      nodes {
        ... on Repository {
          name
          description
          url
          stargazerCount
          forkCount
          primaryLanguage { name color }
          topics: repositoryTopics(first: 5) {
            nodes { topic { name } }
          }
        }
      }
    }
  }
}
"""

CONTRIBUTIONS_QUERY = """
query($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
      totalRepositoryContributions
      totalPullRequestReviewContributions
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
          }
        }
      }
    }
  }
}
"""

REPOS_QUERY = """
query($login: String!, $cursor: String) {
  user(login: $login) {
    repositories(
      first: 50
      after: $cursor
      privacy: PUBLIC
      orderBy: { field: UPDATED_AT, direction: DESC }
    ) {
      pageInfo { hasNextPage endCursor }
      nodes {
        name
        description
        url
        homepageUrl
        stargazerCount
        forkCount
        watcherCount: watchers { totalCount }
        isForked: isFork
        isArchived
        createdAt
        updatedAt
        pushedAt
        defaultBranchRef {
          target {
            ... on Commit {
              history { totalCount }
            }
          }
        }
        primaryLanguage { name color }
        languages(first: 8, orderBy: { field: SIZE, direction: DESC }) {
          edges { size node { name color } }
        }
        repositoryTopics(first: 10) {
          nodes { topic { name } }
        }
        releases { totalCount }
        issues(states: OPEN) { totalCount }
        pullRequests(states: OPEN) { totalCount }
      }
    }
  }
}
"""

LANGUAGE_STATS_QUERY = """
query($login: String!, $cursor: String) {
  user(login: $login) {
    repositories(
      first: 50
      after: $cursor
      privacy: PUBLIC
      isFork: false
      orderBy: { field: UPDATED_AT, direction: DESC }
    ) {
      pageInfo { hasNextPage endCursor }
      nodes {
        languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
          edges { size node { name color } }
        }
      }
    }
  }
}
"""

# ---- helpers ----

def graphql(token: str, query: str, variables: dict) -> dict:
    payload = json.dumps({"query": query, "variables": variables}).encode()
    req = urllib.request.Request(
        GITHUB_API_URL,
        data=payload,
        headers={"Authorization": f"bearer {token}", "Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req) as res:
        return json.loads(res.read().decode())


def fetch_all_repos(token: str, username: str) -> list:
    repos = []
    cursor = None
    while True:
        data = graphql(token, REPOS_QUERY, {"login": username, "cursor": cursor})
        conn = data["data"]["user"]["repositories"]
        repos.extend(conn["nodes"])
        if not conn["pageInfo"]["hasNextPage"]:
            break
        cursor = conn["pageInfo"]["endCursor"]
    return repos


def fetch_language_stats(token: str, username: str) -> dict:
    lang_bytes: dict[str, int] = {}
    lang_colors: dict[str, str] = {}
    cursor = None
    while True:
        data = graphql(token, LANGUAGE_STATS_QUERY, {"login": username, "cursor": cursor})
        conn = data["data"]["user"]["repositories"]
        for repo in conn["nodes"]:
            for edge in repo["languages"]["edges"]:
                name = edge["node"]["name"]
                lang_bytes[name] = lang_bytes.get(name, 0) + edge["size"]
                lang_colors[name] = edge["node"]["color"]
        if not conn["pageInfo"]["hasNextPage"]:
            break
        cursor = conn["pageInfo"]["endCursor"]
    total = sum(lang_bytes.values()) or 1
    return {
        lang: {
            "bytes": lang_bytes[lang],
            "percent": round(lang_bytes[lang] / total * 100, 2),
            "color": lang_colors[lang],
        }
        for lang in sorted(lang_bytes, key=lambda l: lang_bytes[l], reverse=True)
    }


def fetch_yearly_contributions(token: str, username: str, start_year: int, end_year: int) -> dict:
    result = {}
    for year in range(start_year, end_year + 1):
        data = graphql(token, CONTRIBUTIONS_QUERY, {
            "login": username,
            "from": f"{year}-01-01T00:00:00Z",
            "to": f"{year}-12-31T23:59:59Z",
        })
        col = data["data"]["user"]["contributionsCollection"]
        cal = col["contributionCalendar"]

        monthly: dict[str, int] = {}
        daily: list[dict] = []
        for week in cal["weeks"]:
            for day in week["contributionDays"]:
                monthly[day["date"][:7]] = monthly.get(day["date"][:7], 0) + day["contributionCount"]
                if day["contributionCount"] > 0:
                    daily.append({"date": day["date"], "count": day["contributionCount"]})

        result[str(year)] = {
            "total": cal["totalContributions"],
            "commits": col["totalCommitContributions"],
            "pullRequests": col["totalPullRequestContributions"],
            "issues": col["totalIssueContributions"],
            "reviews": col["totalPullRequestReviewContributions"],
            "newRepositories": col["totalRepositoryContributions"],
            "monthly": monthly,
            "daily": daily,
        }
        print(f"  {year}: {cal['totalContributions']} contributions")
    return result


# ---- main ----

if __name__ == "__main__":
    token = os.environ.get("GITHUB_TOKEN", "")
    if not token:
        print("エラー: 環境変数 GITHUB_TOKEN が未設定です。")
        sys.exit(1)

    username = GITHUB_USERNAME
    print(f"[1/4] プロフィール取得...")
    profile_data = graphql(token, PROFILE_QUERY, {"login": username})
    profile = profile_data["data"]["user"]

    print(f"[2/4] リポジトリ一覧取得...")
    repos_raw = fetch_all_repos(token, username)
    repos = []
    for r in repos_raw:
        commit_count = None
        try:
            commit_count = r["defaultBranchRef"]["target"]["history"]["totalCount"]
        except (TypeError, KeyError):
            pass
        repos.append({
            "name": r["name"],
            "description": r["description"],
            "url": r["url"],
            "homepageUrl": r["homepageUrl"],
            "stars": r["stargazerCount"],
            "forks": r["forkCount"],
            "watchers": r["watcherCount"]["totalCount"],
            "commits": commit_count,
            "isFork": r["isForked"],
            "isArchived": r["isArchived"],
            "primaryLanguage": r["primaryLanguage"]["name"] if r["primaryLanguage"] else None,
            "primaryLanguageColor": r["primaryLanguage"]["color"] if r["primaryLanguage"] else None,
            "languages": [
                {"name": e["node"]["name"], "color": e["node"]["color"], "bytes": e["size"]}
                for e in r["languages"]["edges"]
            ],
            "topics": [n["topic"]["name"] for n in r["repositoryTopics"]["nodes"]],
            "releases": r["releases"]["totalCount"],
            "openIssues": r["issues"]["totalCount"],
            "openPRs": r["pullRequests"]["totalCount"],
            "createdAt": r["createdAt"],
            "updatedAt": r["updatedAt"],
            "pushedAt": r["pushedAt"],
        })
    print(f"  {len(repos)} repos")

    print(f"[3/4] 言語統計取得...")
    languages = fetch_language_stats(token, username)
    print(f"  {len(languages)} languages")

    print(f"[4/4] 年別コントリビューション取得 (2020-{datetime.now().year})...")
    contributions = fetch_yearly_contributions(token, username, 2020, datetime.now().year)

    # ピン留めリポジトリ整形
    pinned = []
    for p in profile.pop("pinnedItems", {}).get("nodes", []):
        pinned.append({
            "name": p["name"],
            "description": p["description"],
            "url": p["url"],
            "stars": p["stargazerCount"],
            "forks": p["forkCount"],
            "primaryLanguage": p["primaryLanguage"]["name"] if p["primaryLanguage"] else None,
            "primaryLanguageColor": p["primaryLanguage"]["color"] if p["primaryLanguage"] else None,
            "topics": [n["topic"]["name"] for n in p["topics"]["nodes"]],
        })

    output = {
        "fetchedAt": datetime.utcnow().isoformat() + "Z",
        "profile": profile,
        "pinnedRepositories": pinned,
        "repositories": repos,
        "languageStats": languages,
        "contributions": contributions,
    }

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\n完了: {OUTPUT_PATH}")
    print(f"  リポジトリ数  : {len(repos)}")
    print(f"  言語数        : {len(languages)}")
    print(f"  取得年数      : {len(contributions)}")
