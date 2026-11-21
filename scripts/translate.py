#!/usr/bin/env python3
"""Translate UI dictionaries and recipe prose using locally installed Argos models."""

from __future__ import annotations

import argparse
import json
import re
import sys
from collections import deque
from pathlib import Path
from typing import Any, Callable

ROOT = Path(__file__).resolve().parents[1]
CONFIG_PATH = ROOT / "src/lib/i18n/languages.json"
UI_DIR = ROOT / "src/lib/locales"
RECIPES_DIR = ROOT / "src/content/recipes"
TOKEN_PATTERN = re.compile(
    r"\{\{?[^{}]+\}\}?|<[^>]+>|\[[^\]]+\]\([^)]+\)|`[^`]+`|%[0-9]*[sd]"
)
FRONTMATTER_PATTERN = re.compile(r"\A---\s*\r?\n(.*?)\r?\n---\s*(.*)\Z", re.DOTALL)


def load_config() -> tuple[str, list[dict[str, str]], list[str]]:
    config = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    return config["default"], config["languages"], config["translationTargets"]


def installed_routes() -> tuple[dict[str, list[tuple[str, Any]]], list[str]]:
    try:
        from argostranslate import translate
    except ImportError as error:
        raise RuntimeError(
            "Argos Translate is not installed. Run: python -m pip install -r scripts/requirements-translate.txt"
        ) from error

    languages = translate.get_installed_languages()
    graph: dict[str, list[tuple[str, Any]]] = {}
    installed_codes = sorted({language.code for language in languages})
    for language in languages:
        for translation in language.translations_from:
            graph.setdefault(language.code, []).append((translation.to_lang.code, translation))
    return graph, installed_codes


def install_available_models(source: str, targets: list[str]) -> tuple[list[str], list[str]]:
    try:
        from argostranslate import package
    except ImportError as error:
        raise RuntimeError(
            "Argos Translate is not installed. Run: python -m pip install -r scripts/requirements-translate.txt"
        ) from error

    package.update_package_index()
    available = package.get_available_packages()
    installed_pairs = {
        (model.from_code, model.to_code) for model in package.get_installed_packages()
    }
    installed: list[str] = []
    unavailable: list[str] = []
    for target in targets:
        if (source, target) in installed_pairs:
            continue
        model = next(
            (
                candidate
                for candidate in available
                if candidate.from_code == source and candidate.to_code == target
            ),
            None,
        )
        if model is None:
            unavailable.append(target)
            continue
        print(f"Installing Argos model {source} -> {target} ({model.package_version})...")
        model.install()
        installed.append(target)
    return installed, unavailable


def find_route(graph: dict[str, list[tuple[str, Any]]], source: str, target: str) -> list[Any] | None:
    queue: deque[tuple[str, list[Any]]] = deque([(source, [])])
    visited = {source}
    while queue:
        code, route = queue.popleft()
        if code == target:
            return route
        for next_code, translation in graph.get(code, []):
            if next_code not in visited:
                visited.add(next_code)
                queue.append((next_code, [*route, translation]))
    return None


def route_label(source: str, target: str, route: list[Any]) -> str:
    codes = [source]
    codes.extend(translation.to_lang.code for translation in route)
    return " -> ".join(codes)


def make_translator(route: list[Any]) -> Callable[[str], str]:
    def translate_text(text: str) -> str:
        translated_parts: list[str] = []
        cursor = 0
        for match in TOKEN_PATTERN.finditer(text):
            prose = text[cursor:match.start()]
            for model in route:
                prose = model.translate(prose)
            translated_parts.extend((prose, match.group(0)))
            cursor = match.end()
        prose = text[cursor:]
        for model in route:
            prose = model.translate(prose)
        translated_parts.append(prose)
        return "".join(translated_parts)

    return translate_text


def translate_tree(value: Any, translator: Callable[[str], str], overwrite: bool) -> Any:
    if isinstance(value, dict):
        return {key: translate_tree(item, translator, overwrite) for key, item in value.items()}
    if isinstance(value, list):
        return [translate_tree(item, translator, overwrite) for item in value]
    if isinstance(value, str):
        return translator(value) if overwrite or not value.strip() else value
    return value


def load_dictionary(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {}
    return json.loads(path.read_text(encoding="utf-8"))


def fill_missing(source: Any, target: Any, translator: Callable[[str], str], overwrite: bool) -> tuple[Any, int]:
    count = 0
    if isinstance(source, dict):
        result = target.copy() if isinstance(target, dict) else {}
        for key, value in source.items():
            if key not in result:
                result[key] = translate_tree(value, translator, True)
                count += count_strings(value)
            else:
                result[key], translated = fill_missing(value, result[key], translator, overwrite)
                count += translated
        return result, count
    if isinstance(source, list):
        existing = target if isinstance(target, list) else []
        result = []
        for index, value in enumerate(source):
            if index >= len(existing):
                result.append(translate_tree(value, translator, True))
                count += count_strings(value)
            else:
                translated_value, translated = fill_missing(value, existing[index], translator, overwrite)
                result.append(translated_value)
                count += translated
        return result, count
    if isinstance(source, str) and (overwrite or not isinstance(target, str) or not target.strip()):
        return translator(source), 1
    return target, count


def count_strings(value: Any) -> int:
    if isinstance(value, str):
        return 1
    if isinstance(value, dict):
        return sum(count_strings(item) for item in value.values())
    if isinstance(value, list):
        return sum(count_strings(item) for item in value)
    return 0


def translate_ui(language: str, translator: Callable[[str], str], overwrite: bool) -> int:
    source = load_dictionary(UI_DIR / "en.json")
    target_path = UI_DIR / f"{language}.json"
    target = load_dictionary(target_path)
    translated, count = fill_missing(source, target, translator, overwrite)
    target_path.write_text(json.dumps(translated, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return count


def markdown_source(frontmatter: dict[str, Any]) -> str:
    lines: list[str] = []
    if frontmatter.get("title"):
        lines.extend([f"# {frontmatter['title']}", ""])
    if frontmatter.get("description"):
        lines.extend([str(frontmatter["description"]).strip(), ""])
    if frontmatter.get("instructions"):
        lines.extend(["## Instructions"])
        for index, step in enumerate(frontmatter["instructions"], start=1):
            text = step.get("text", "") if isinstance(step, dict) else str(step)
            lines.append(f"{index}. {text}")
    return "\n".join(lines).strip()


def translate_markdown_prose(markdown: str, translator: Callable[[str], str]) -> str:
    translated_lines: list[str] = []
    for line in markdown.splitlines():
        if not line.strip():
            translated_lines.append(line)
            continue
        heading = re.match(r"^(#{1,6}\s+)(.*)$", line)
        if heading:
            prefix, text = heading.groups()
            if text.strip().lower() in {"description", "about", "benefits", "health benefits", "instructions", "method", "preparation"}:
                translated_lines.append(line)
            else:
                translated_lines.append(prefix + translator(text))
            continue
        list_prefix = re.match(r"^(\s*(?:[-*+]\s+|\d+[.)]\s+|>\s+))(.*)$", line)
        if list_prefix:
            prefix, text = list_prefix.groups()
            translated_lines.append(prefix + translator(text))
        else:
            translated_lines.append(translator(line))
    return "\n".join(translated_lines)


def translate_recipe_file(path: Path, language: str, translator: Callable[[str], str], overwrite: bool) -> bool:
    try:
        import yaml
    except ImportError as error:
        raise RuntimeError(
            "PyYAML is not installed. Run: python -m pip install -r scripts/requirements-translate.txt"
        ) from error

    original = path.read_text(encoding="utf-8")
    frontmatter_match = FRONTMATTER_PATTERN.match(original)
    if not frontmatter_match:
        raise ValueError(f"Missing YAML frontmatter in {path.name}")
    frontmatter_text, body = frontmatter_match.groups()
    metadata = yaml.safe_load(frontmatter_text) or {}
    block_pattern = re.compile(
		r"^:::lang\s+([a-z]{2,3}(?:-[a-z0-9]{2,8})*)\s*\r?\n([\s\S]*?)^:::\s*$",
        re.MULTILINE,
    )
    blocks = {match.group(1): match.group(2).strip() for match in block_pattern.finditer(body)}
    source = blocks.get("en") or markdown_source(metadata)
    if not source:
        return False
    if language in blocks and not overwrite:
        return False

    blocks.setdefault("en", source)
    blocks[language] = translate_markdown_prose(source, translator)
    remaining = block_pattern.sub("", body).strip()
    rendered_blocks = "\n\n".join(f":::lang {code}\n{content}\n:::" for code, content in blocks.items())
    combined_body = "\n\n".join(part for part in (remaining, rendered_blocks) if part)
    path.write_text(f"---\n{frontmatter_text}\n---\n{combined_body}\n", encoding="utf-8")
    return True


def main() -> int:
    default_language, configured_languages, translation_targets = load_config()
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--languages", nargs="+", choices=translation_targets, default=translation_targets)
    parser.add_argument("--type", choices=("all", "ui", "recipes"), default="all")
    parser.add_argument("--overwrite", action="store_true", help="Replace existing translations for requested languages.")
    parser.add_argument("--list-models", action="store_true", help="Show installed languages and configured translation paths.")
    parser.add_argument(
        "--install-models",
        action="store_true",
        help="Download and install available direct English-to-target Argos models before translating.",
    )
    args = parser.parse_args()

    if args.install_models:
        try:
            installed, unavailable = install_available_models(default_language, args.languages)
        except RuntimeError as error:
            print(error, file=sys.stderr)
            return 2
        if installed:
            print(f"Installed models for: {', '.join(installed)}")
        if unavailable:
            print(
                "No direct English model in the Argos package index for: "
                + ", ".join(unavailable),
                file=sys.stderr,
            )

    try:
        graph, installed_codes = installed_routes()
    except RuntimeError as error:
        print(error, file=sys.stderr)
        return 2

    print(f"Installed Argos languages: {', '.join(installed_codes) if installed_codes else '(none)'}")
    routes = {code: find_route(graph, default_language, code) for code in args.languages}
    for code, route in routes.items():
        print(f"{code}: {route_label(default_language, code, route) if route is not None else 'unavailable; install a direct or pivot model'}")
    if args.list_models:
        return 0 if all(route is not None for route in routes.values()) else 2

    missing = [code for code, route in routes.items() if route is None]
    total = 0
    for language, route in routes.items():
        if route is None:
            continue
        translator = make_translator(route)
        if args.type in ("all", "ui"):
            count = translate_ui(language, translator, args.overwrite)
            print(f"UI {language}: translated {count} string(s).")
            total += count
        if args.type in ("all", "recipes"):
            changed = 0
            for recipe_path in sorted(RECIPES_DIR.glob("*.md")):
                if translate_recipe_file(recipe_path, language, translator, args.overwrite):
                    changed += 1
            print(f"Recipes {language}: updated {changed} file(s).")
            total += changed
    if missing:
        print(f"Cannot generate requested languages without installed model paths: {', '.join(missing)}", file=sys.stderr)
        return 2
    print(f"Done. {total} translation item(s) generated or updated.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())