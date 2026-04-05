"""
GitHub 年別コントリビューション統計取得スクリプト
Usage: python fetch_github_stats.py [year] [username]
       python fetch_github_stats.py 2025 emar27181
"""

import sys
import json
import os
import urllib.request
import urllib.error
from datetime import datetime

GITHUB_USERNAME = "emar27181"
GITHUB_API_URL = "https://api.github.com/graphql"

QUERY = """
query($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    name
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

def fetch_stats(year: int, username: str, token: str) -> dict:
    variables = {
        "login": username,
        "from": f"{year}-01-01T00:00:00Z",
        "to": f"{year}-12-31T23:59:59Z",
    }
    payload = json.dumps({"query": QUERY, "variables": variables}).encode("utf-8")
    req = urllib.request.Request(
        GITHUB_API_URL,
        data=payload,
        headers={
            "Authorization": f"bearer {token}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    with urllib.request.urlopen(req) as res:
        return json.loads(res.read().decode("utf-8"))


def print_stats(data: dict, year: int):
    user = data.get("data", {}).get("user", {})
    col = user.get("contributionsCollection", {})
    cal = col.get("contributionCalendar", {})

    # 月別集計
    monthly: dict[str, int] = {}
    for week in cal.get("weeks", []):
        for day in week.get("contributionDays", []):
            month = day["date"][:7]  # YYYY-MM
            monthly[month] = monthly.get(month, 0) + day["contributionCount"]

    print(f"\n===== {year}年 GitHub コントリビューション統計 ({user.get('name', username)}) =====")
    print(f"  総コントリビューション数  : {cal.get('totalContributions', 0):>6}")
    print(f"  コミット                  : {col.get('totalCommitContributions', 0):>6}")
    print(f"  プルリクエスト            : {col.get('totalPullRequestContributions', 0):>6}")
    print(f"  Issue                     : {col.get('totalIssueContributions', 0):>6}")
    print(f"  レビュー                  : {col.get('totalPullRequestReviewContributions', 0):>6}")
    print(f"  新規リポジトリ            : {col.get('totalRepositoryContributions', 0):>6}")
    print(f"\n--- 月別コントリビューション ---")
    for month in sorted(monthly):
        bar = "█" * (monthly[month] // 5)
        print(f"  {month}  {monthly[month]:>4}  {bar}")


if __name__ == "__main__":
    year = int(sys.argv[1]) if len(sys.argv) > 1 else datetime.now().year
    username = sys.argv[2] if len(sys.argv) > 2 else GITHUB_USERNAME

    token = os.environ.get("GITHUB_TOKEN", "")
    if not token:
        print("エラー: 環境変数 GITHUB_TOKEN が設定されていません。")
        print("  export GITHUB_TOKEN=ghp_xxxxxxxxxxxx")
        sys.exit(1)

    try:
        data = fetch_stats(year, username, token)
        if "errors" in data:
            print("API エラー:", data["errors"])
            sys.exit(1)
        print_stats(data, year)
    except urllib.error.HTTPError as e:
        print(f"HTTP エラー {e.code}: {e.reason}")
        sys.exit(1)
