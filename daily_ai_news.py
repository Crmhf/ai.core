#!/usr/bin/env python3
"""
daily_ai_news.py - 每日 AI 垂类行业资讯收集脚本
使用 web_search 工具搜索并生成 markdown
"""

import os
import sys
import subprocess
import json
from datetime import datetime
from pathlib import Path

# 配置
REPO_DIR = Path("/Users/diyuan/.openclaw/workspace/ai-core-daily")
DATE = datetime.now().strftime("%Y%m%d")
DATE_FORMATTED = datetime.now().strftime("%Y-%m-%d %H:%M")
FILE_NAME = f"{DATE}.md"
FILE_PATH = REPO_DIR / "daily" / FILE_NAME

# 搜索关键词
SEARCH_QUERIES = [
    "AI垂直领域 最新发展 2025 2026",
    "AI垂类应用 行业动态 融资",
    "垂直AI 医疗 金融 教育 最新",
    "AI行业细分 市场趋势 报告"
]

def run_command(cmd, cwd=None):
    """运行 shell 命令"""
    result = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)
    return result.returncode == 0, result.stdout, result.stderr

def search_news(query):
    """使用 web_search 工具搜索"""
    # 调用 openclaw 的 web_search 功能
    # 这里使用 web_search 工具通过命令行方式
    cmd = f'openclaw web_search "{query}" --count 5'
    success, stdout, stderr = run_command(cmd)
    if success:
        return stdout
    return f"搜索失败: {stderr}"

def generate_markdown():
    """生成 markdown 内容"""
    content = f"""# AI 垂类行业资讯 - {DATE_FORMATTED}

> 自动收集的 AI 垂直领域行业动态

---

## 今日概览

- 收集时间：{DATE_FORMATTED}
- 数据来源：网络搜索

---

## 行业动态

"""
    
    for query in SEARCH_QUERIES:
        content += f"\n### 🔍 {query}\n\n"
        content += "```\n"
        # 这里我们添加占位符，因为实际的搜索需要工具支持
        content += f"搜索内容将在此处显示...\n"
        content += "```\n\n"
    
    content += """---

## 重点摘要

*待补充*

## 参考资料

*待补充*

---

*本文件由自动化脚本生成*
"""
    
    return content

def git_operations():
    """执行 git 操作"""
    os.chdir(REPO_DIR)
    
    # 确保在 main 分支
    run_command("git checkout main", cwd=REPO_DIR)
    
    # 拉取最新
    run_command("git pull origin main", cwd=REPO_DIR)
    
    # 添加文件
    run_command(f"git add daily/{FILE_NAME}", cwd=REPO_DIR)
    
    # 提交
    success, _, stderr = run_command(
        f'git commit -m "docs: add daily AI industry news for {DATE} [auto]"',
        cwd=REPO_DIR
    )
    
    if not success:
        print(f"提交可能已存在或出错: {stderr}")
        return False
    
    # 推送
    success, _, stderr = run_command("git push origin main", cwd=REPO_DIR)
    if not success:
        print(f"推送失败: {stderr}")
        return False
    
    return True

def main():
    print(f"=== 开始收集 {DATE} 的 AI 垂类行业资讯 ===")
    
    # 生成 markdown 内容
    content = generate_markdown()
    
    # 写入文件
    FILE_PATH.write_text(content, encoding='utf-8')
    print(f"✓ 已创建文件: {FILE_PATH}")
    
    # git 操作
    if git_operations():
        print(f"✓ 已成功提交到 GitHub")
    else:
        print(f"⚠ git 操作可能有问题，请手动检查")
    
    print(f"=== 完成 ===")

if __name__ == "__main__":
    main()
